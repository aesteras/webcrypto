# WebCrypto API

Install dependencies:

    npm install

To generate self-signed SSL certificate and private key (just press enter and leave all fields empty):

    openssl genrsa -out key.pem
    openssl req -new -key key.pem -out csr.pem
    openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
    rm csr.pem

To run HTTPS development server:

    npm run nodemon

To run HTTPS production server:

    npm run node
