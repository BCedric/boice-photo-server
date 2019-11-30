const queries = {
  getPicture: "SELECT * FROM Pictures WHERE id = $id",
  getPicturesByGallery: "SELECT * FROM Pictures WHERE galleryId = $galleryId",
  putPicture: "UPDATE Pictures SET name = $name WHERE id = $id",
  deletePicture: "DELETE FROM Pictures WHERE id = $id",
  postPicture: "INSERT INTO Pictures (name, width, height, galleryId) VALUES ($name, $width, $height, $galleryId);",
  allPictures: "SELECT * FROM Pictures",
  getPreviewPicture: "SELECT * FROM Pictures WHERE galleryId = $galleryId AND galleryPreview = true",
  updatePictureGalleryPreview: "UPDATE Pictures SET galleryPreview = $galleryPreview WHERE id = $id",
  deleteTable: (table) => "DROP TABLE " + table + ";",
  createTablePictures: "CREATE TABLE `Pictures` (`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`name`	TEXT,`height`	INTEGER,`width`	INTEGER,'galleryId' INTEGER REFERENCES Galleries (id) ON DELETE CASCADE ON UPDATE CASCADE,'galleryPreview' BOOLEAN DEFAULT (false), FOREIGN KEY(`galleryId`) REFERENCES `Galleries`(`id`));",
  createTableGalleries: "CREATE TABLE `Galleries` (`name`	TEXT,`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`description`	TEXT, `parentId`	INTEGER, isList BOOLEAN DEFAULT (false), isInCarousel BOOLEAN DEFAULT (false));",
  getGallery: "SELECT * FROM Galleries WHERE id = $id",
  getGalleryByName: "SELECT * FROM Galleries WHERE name = $name",
  getCarouselGalleries: "SELECT * FROM Galleries WHERE isInCarousel = true",
  postGallery: "INSERT INTO Galleries (name, description, parentId, isList) VALUES ($name, $description, $parentId, false)",
  allGalleries: "SELECT * From Galleries WHERE isList = false",
  deleteGallery: "DELETE FROM Galleries WHERE id =$id",
  updateGalleryParentIdByName: "UPDATE Galleries SET parentId = (SELECT id from Galleries WHERE name = $parentName) WHERE name = $galleryName;",
  updateGalleryParentId: "UPDATE Galleries SET parentId = $parentId WHERE id = $id;",
  postGalleriesList: "INSERT INTO Galleries (name, description, isList) VALUES ($name, $description, true)",
  getGalleriesListChildren: "SELECT * From Galleries WHERE parentId = $parentId ",
  allGalleriesLists: "Select * From Galleries WHERE isList = true",
  getRandomPictureFromGallery: "SELECT * FROM Pictures WHERE galleryId = $id AND Pictures.height < Pictures.width ORDER BY random() Limit 1",
  getGalleriesListOfGallery: "SELECT * FROM Galleries WHERE parentId = (SELECT parentId FROM Galleries WHERE id = $id) ORDER BY id",
  getGalleriesNotInLists: 'SELECT * FROM GALLERIES WHERE parentId IS NULL AND isList = false',
  updateGalleryDescription: `UPDATE Galleries SET description = $description WHERE id = $id`,
  updateGalleryIsInCarousel: `UPDATE Galleries SET isInCarousel = $isInCarousel WHERE id = $id`,
  updateGallery: `UPDATE Galleries SET description = $description, name = $name WHERE id = $id`
}

export default queries
