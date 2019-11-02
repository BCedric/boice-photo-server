const queries = {
  getPicture: "SELECT * FROM Pictures WHERE id = $id",
  getPicturesByGallery: "SELECT * FROM Pictures WHERE gallery_id = $gallery_id",
  putPicture: "UPDATE Pictures SET name = $name WHERE id = $id",
  deletePicture: "DELETE FROM Pictures WHERE id = $id",
  postPicture: ({ name, adresse, width, height, gallery_id }) => {
    return gallery_id === undefined
      ? "INSERT INTO Pictures (name, adresse, width, height) VALUES ('" + name + "', '" + adresse + "', '" + width + "', '" + height + "');"
      : "INSERT INTO Pictures (name, adresse, width, height, gallery_id) VALUES ('" + name + "', '" + adresse + "', '" + width + "', '" + height + "', '" + gallery_id + "');"
  },
  allPictures: "SELECT * FROM Pictures",
  deleteTable: (table) => "DROP TABLE " + table + ";",
  createTablePictures: "CREATE TABLE `Pictures` (`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`name`	TEXT,`adresse`	TEXT,`height`	INTEGER,`width`	INTEGER, `gallery_id`	INTEGER, FOREIGN KEY(`gallery_id`) REFERENCES `Galleries`(`id`));",
  createTableGalleries: "CREATE TABLE `Galleries` (`name`	TEXT,`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`description`	TEXT, `parent_id`	INTEGER);",
  getGallery: "SELECT * FROM Galleries WHERE id = $id",
  getGalleryByName: "SELECT * FROM Galleries WHERE name = $name",
  postGallery: "INSERT INTO Galleries (name, parent_id) VALUES ($name, $parent_id)",
  allGalleries: "SELECT Galleries.* From Galleries, Pictures where Galleries.id = Pictures.gallery_id group by Galleries.id;",
  deleteGallery: "DELETE FROM Galleries WHERE id =$id",
  updateGalleryParentId: "UPDATE Galleries SET parent_id = (SELECT id from Galleries WHERE name = $parentName) WHERE name = $galleryName;",
  getGalleriesList: (parent_id) => "SELECT g1.name as parent_name, g2.* FROM Galleries as g1, Galleries as g2 WHERE g2.parent_id == " + parent_id + " AND g2.parent_id = g1.id GROUP BY g2.id;",
  allGalleriesLists: "Select * From Galleries WHERE Galleries.parent_id IS NULL AND Galleries.id NOT IN (SELECT Galleries.id FROM Galleries, Pictures WHERE parent_id IS NULL AND Galleries.id = Pictures.gallery_id GROUP BY Galleries.id)",
  getRandomPictureFromGallerie: id => "SELECT * FROM Pictures WHERE gallery_id = '" + id + "' AND Pictures.height < Pictures.width ORDER BY random() Limit 1",
  getGalleriesListOfGallery: id => "SELECT * FROM Galleries WHERE parent_id = (SELECT parent_id FROM Galleries WHERE id = " + id + ") ORDER BY id",
  getGalleriesNotInLists: 'SELECT * FROM GALLERIES WHERE parent_id IS NULL AND id NOT IN (SELECT parent_id FROM Galleries WHERE parent_id IS NOT NULL)',
  updateGalleriesDescription: 'UPDATE Galleries SET description = $description WHERE name = $name'
}

export default queries
