const queries = {
  getPicture: "SELECT * FROM Pictures WHERE id = $id",
  getPicturesByGallery: "SELECT * FROM Pictures WHERE galleryId = $galleryId",
  putPicture: "UPDATE Pictures SET name = $name WHERE id = $id",
  deletePicture: "DELETE FROM Pictures WHERE id = $id",
  postPicture: "INSERT INTO Pictures (name, width, height, galleryId) VALUES ($name, $width, $height, $galleryId);",
  allPictures: "SELECT * FROM Pictures",
  deleteTable: (table) => "DROP TABLE " + table + ";",
  createTablePictures: "CREATE TABLE `Pictures` (`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`name`	TEXT,`height`	INTEGER,`width`	INTEGER,'galleryId' INTEGER REFERENCES Galleries (id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY(`galleryId`) REFERENCES `Galleries`(`id`));",
  createTableGalleries: "CREATE TABLE `Galleries` (`name`	TEXT,`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`description`	TEXT, `parentId`	INTEGER, isList BOOLEAN);",
  getGallery: "SELECT * FROM Galleries WHERE id = $id",
  getGalleryByName: "SELECT * FROM Galleries WHERE name = $name",
  postGallery: "INSERT INTO Galleries (name, description, parentId, isList) VALUES ($name, $description, $parentId, false)",
  allGalleries: "SELECT Galleries.* From Galleries, Pictures where Galleries.id = Pictures.galleryId group by Galleries.id;",
  deleteGallery: "DELETE FROM Galleries WHERE id =$id",
  updateGalleryParentIdByName: "UPDATE Galleries SET parentId = (SELECT id from Galleries WHERE name = $parentName) WHERE name = $galleryName;",
  updateGalleryParentId: "UPDATE Galleries SET parentId = $parentId WHERE id = $id;",
  postGalleriesList: "INSERT INTO Galleries (name, description, isList) VALUES ($name, $description, true)",
  getGalleriesListChildren: "SELECT * From Galleries WHERE parentId = $parentId ",
  allGalleriesLists: "Select * From Galleries WHERE Galleries.parentId IS NULL AND Galleries.id NOT IN (SELECT Galleries.id FROM Galleries, Pictures WHERE parentId IS NULL AND Galleries.id = Pictures.galleryId GROUP BY Galleries.id)",
  getRandomPictureFromGallery: "SELECT * FROM Pictures WHERE galleryId = $id AND Pictures.height < Pictures.width ORDER BY random() Limit 1",
  getGalleriesListOfGallery: "SELECT * FROM Galleries WHERE parentId = (SELECT parentId FROM Galleries WHERE id = $id) ORDER BY id",
  getGalleriesNotInLists: 'SELECT * FROM GALLERIES WHERE parentId IS NULL AND isList = false',
  updateGalleryDescription: `UPDATE Galleries SET description = $description WHERE id = $id`,
  updateGallery: `UPDATE Galleries SET description = $description, name = $name WHERE id = $id`
}

export default queries
