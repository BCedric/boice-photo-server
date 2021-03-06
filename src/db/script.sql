CREATE TABLE `Galleries` (
    'name'        TEXT,
    'id'          INTEGER NOT NULL
                        PRIMARY KEY AUTOINCREMENT
                        UNIQUE,
    'description' TEXT,
    'parentId'    INTEGER,
    'isList'      BOOLEAN DEFAULT (false),
    'isInCarousel' BOOLEAN DEFAULT (false)
);


CREATE TABLE `Pictures` (
	'id'        INTEGER NOT NULL
                      PRIMARY KEY AUTOINCREMENT
                      UNIQUE,
    'name'      TEXT,
    'height'    INTEGER,
    'width'     INTEGER,
    'galleryId' INTEGER REFERENCES Galleries (id) ON DELETE CASCADE
                                                ON UPDATE CASCADE,
    'galleryPreview' BOOLEAN DEFAULT (false),
    FOREIGN KEY (
        'galleryId'
    )
    REFERENCES Galleries (id) 
);


CREATE TABLE Users (
    'id'       INTEGER       PRIMARY KEY,
    'name'     VARCHAR (32),
    'password' VARCHAR (32),
    'token'    VARCHAR (116) 
);
