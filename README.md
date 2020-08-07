# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows registered users to shorten long URLs (à la bit.ly).

## Final Product

!["Main URL Page"](https://github.com/jyxgao/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["Edit URL Page"](https://github.com/jyxgao/tinyapp/blob/master/docs/urls-edit-page.png?raw=true)

## Navigation

Users need to first register to gain access to URL shortening feature and log URLs. App keeps track of total visits through clicking on the short URL or through visiting /u/:shorturl. 

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