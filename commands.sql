CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES ('Vasiliy', 'http://hello-moto.org', 'Da best hello in the World!', 0);

INSERT INTO blogs (author, url, title, likes) VALUES ('Petrovich', 'http://zag-zag.info', 'Zag!', 0);
