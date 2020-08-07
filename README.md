# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows registered users to shorten long URLs (à la bit.ly).

## Final Product

##### Main URL Page

!["Main URL Page"](https://github.com/jyxgao/tinyapp/blob/master/docs/urls-page.png?raw=true)

##### Example Edit Page

!["Edit URL Page"](https://github.com/jyxgao/tinyapp/blob/master/docs/urls-edit-page.png?raw=true)

## Navigation

Users need to register to gain access to URL shortening feature and start logging URLs.

Clicking on shortened URL or short URL or through visiting /u/:shorturl will redirect to the original site. App keeps track of total visits to sites using the shortened URL.

Logged in users may edit and delete their URLs.

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.