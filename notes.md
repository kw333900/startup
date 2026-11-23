# CS 260 Notes - I love web programming

This file represents what I have learned about web programming.

- [My startup](https://tnratings.click)
- [My simon](https://simon.tnratings.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

Interesting things I have learned about AWS

## HTML

Interesting things I have learned about HTML:

- You can have JS and CSS in an HTML file. But you cannot have HTML in a JS or CSS file.

## React

Interesting things I have learned about React:

- Reactivity of an application is more than just a button 'reacting' and changing color when you hover over it.
It is when the data under the hood is accurately changed and reflected after the user has changed it (logged in, recorded a score, etc.).

## MongoDB and the Startup DB deliverable

- Keep `dbConfig.json` out of GitHub. The startup repository ignores this filename, including `service/dbConfig.json`.
- The backend connects to the `tnratings` database through `service/database.js`.
- User documents contain bcrypt password hashes, authentication tokens, ratings, and criteria.
- Group membership is stored in MongoDB. Default groups are inserted only when they do not already exist, so app restarts preserve membership changes.
- Local verification and production deployment are still to do.
