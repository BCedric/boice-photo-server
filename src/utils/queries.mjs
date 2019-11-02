const queries = {
  getPicture: "SELECT * FROM Pictures WHERE id = $id",
  getPicturesByGallery: "SELECT * FROM Pictures WHERE galleryId = $galleryId",
  putPicture: "UPDATE Pictures SET name = $name WHERE id = $id",
  deletePicture: "DELETE FROM Pictures WHERE id = $id",
  postPicture: "INSERT INTO Pictures (name, adresse, width, height, galleryId) VALUES ($name, $adresse, $width, $height, $galleryId);",
  allPictures: "SELECT * FROM Pictures",
  deleteTable: (table) => "DROP TABLE " + table + ";",
  createTablePictures: "CREATE TABLE `Pictures` (`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`name`	TEXT,`adresse`	TEXT,`height`	INTEGER,`width`	INTEGER, `galleryId`	INTEGER, FOREIGN KEY(`galleryId`) REFERENCES `Galleries`(`id`));",
  createTableGalleries: "CREATE TABLE `Galleries` (`name`	TEXT,`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`description`	TEXT, `parentId`	INTEGER);",
  getGallery: "SELECT * FROM Galleries WHERE id = $id",
  getGalleryByName: "SELECT * FROM Galleries WHERE name = $name",
  postGallery: "INSERT INTO Galleries (name, parentId) VALUES ($name, $parentId)",
  allGalleries: "SELECT Galleries.* From Galleries, Pictures where Galleries.id = Pictures.galleryId group by Galleries.id;",
  deleteGallery: "DELETE FROM Galleries WHERE id =$id",
  updateGalleryParentId: "UPDATE Galleries SET parentId = (SELECT id from Galleries WHERE name = $parentName) WHERE name = $galleryName;",
  getGalleriesList: "SELECT g1.name as parent_name, g2.* FROM Galleries as g1, Galleries as g2 WHERE g2.parentId == $parentId AND g2.parentId = g1.id GROUP BY g2.id;",
  allGalleriesLists: "Select * From Galleries WHERE Galleries.parentId IS NULL AND Galleries.id NOT IN (SELECT Galleries.id FROM Galleries, Pictures WHERE parentId IS NULL AND Galleries.id = Pictures.galleryId GROUP BY Galleries.id)",
  getRandomPictureFromGallerie: "SELECT * FROM Pictures WHERE galleryId = $id AND Pictures.height < Pictures.width ORDER BY random() Limit 1",
  getGalleriesListOfGallery: "SELECT * FROM Galleries WHERE parentId = (SELECT parentId FROM Galleries WHERE id = $id) ORDER BY id",
  getGalleriesNotInLists: 'SELECT * FROM GALLERIES WHERE parentId IS NULL AND id NOT IN (SELECT parentId FROM Galleries WHERE parentId IS NOT NULL)',
  updateGalleriesDescription: 'UPDATE Galleries SET description = $description WHERE name = $name'
}

export default queries
