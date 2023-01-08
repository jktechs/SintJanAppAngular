from tika import parser # pip install tika
import re
import json

def find(objs, key):
    return list(filter(lambda value: value["lastName"].lower().startswith(key[0:2].lower()) and value["initials"][0].lower() == key[2].lower(), objs.values()))

patrenA = r"(de heer|mevrouw) ([A-Z].) ([A-Za-z]+,*)\s+tel. [0-9\-]+ –\s+([A-Za-z.]+@stichtinglvo\.nl)"
# aanhef
# voorletter
# achternaam
# email
patrenB = r"([A-Za-z\-]+)\s+(?:dhr\.|mevr\.)\s+([a-z\.]+)\s*((?:\s*(?:van|den|der|in|de))*)\s+([ a-z.,\n&]+)\s([a-z]+\.[a-z]+@\s*stichtinglvo\.nl)"
# achternaam
# voorletters
# tussen voegsel
# vakken
# email

rawPdf = parser.from_file('downloads\\schoolgids.pdf')
rawString = rawPdf["content"]
begin = rawString.find("Namen ")
end = rawString.find("Overzicht",begin)
namesSection = rawString[begin:end]

tmp = {}
for tuple in re.findall(patrenA, namesSection, re.I):
    tmp[tuple[2]] = {"lastName": tuple[2], "initials": tuple[1], "email": tuple[3], "subjects": []}
for tuple in re.findall(patrenB, namesSection, re.I):
    tmp[tuple[0]] = {"lastName": tuple[0], "initials": tuple[1], "email": tuple[4], "subjects": re.sub(r" +", " ", tuple[3].replace("\n"," ")).strip().split(", ")}
certain = {}
duplicates = []
for i in range(26):
    for j in range(26):
        for k in range(26):
            key = chr(i+97)+chr(j+97)+chr(k+97)
            possibilities = find(tmp, key)
            if len(possibilities) == 1:
                certain[key] = possibilities[0]
            if len(possibilities) > 1:
                for duplicate in possibilities:
                    duplicates.append(duplicate)
certain["unknown"] = duplicates
print(json.dumps(certain))