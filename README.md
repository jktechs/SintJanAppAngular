# Sint-Jan App

This is a Angular Android app for the use of various programs used by Sint-Jan.

The source code is spllit in custom libraries and custom components.

Custom libraries:
* Somtoday.ts

   Contains async functions for getting data from Somtoday.
* Zermelo.ts

   Constains async functions for getting and posting data to and from Zermelo.
* GlobalErrorHandler.ts

   Contains the global error handeler that is always called when an error has occured.
* Utils.ts
  * Contains a `Savable` class wich represents an object that can be saved via the Capasitor Prefrences api (Both Somtoday and Zermelo inherit from this class to save login details).
  * Contains a `Token` class wich represents a login token wich has a value and an expire time.
  * Contains the classes `Location`, `Lesson`, `Week`, `Subject` and `Grade`.
  * Contains a `Mutex` class wich represents a value that can only be accesed by one function at a time.
  * Contains the functions:
    * `tryJSONParse` wich either parses a json string or if the json string is invalid it returns `undefined`
    * `setVar` wich sets global variables that can be accesed by the console to make debugging easyer
    * `delay` wich waits for an x amount of time before calling a specific function
    * `pad` wich pads a number with leading zero's (if the input is 4 and a length of 2 the output would be "04")

Custom components:
* footer: The navigation buttons at the bottum of the screen
  * navigation: Handles switching between pages
    * grid-page: The home page with links to all programs (in the future widgets that contain information like grades or messages are will also be supported)
      * widget: WIP
        * grade-widget: WIP
    * subject-list-page: A list of all subjects
      * subject-page: All information about the subjects
    * schedule-page: The scedule of the user
      * kwt-option-page: Selection screen for chosing KWT hours (WIP)
    * settings-page: Shows app settings

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.1.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
