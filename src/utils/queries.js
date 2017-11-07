const queries = {
  getPicture:  "SELECT * FROM Pictures WHERE id = $id",
  getPicturesByGallery: "SELECT * FROM Pictures WHERE gallery_id = $gallery_id",
  putPicture : "UPDATE Pictures SET name = $name WHERE id = $id",
  deletePicture : "DELETE FROM Pictures WHERE id = $id",
  postPicture : ({name, adresse, width, height, gallery_id}) => {
    return gallery_id === undefined
  ?  "INSERT INTO Pictures (name, adresse, width, height) VALUES ('"+name+"', '"+adresse+"', '"+width+"', '"+height+"');"
  :  "INSERT INTO Pictures (name, adresse, width, height, gallery_id) VALUES ('"+name+"', '"+adresse+"', '"+width+"', '"+height+"', '"+gallery_id+"');"},
  allPictures : "SELECT * FROM Pictures",
  deleteTable: (table) => "DROP TABLE " + table + ";",
  createTablePictures: "CREATE TABLE `Pictures` (`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`name`	TEXT,`adresse`	TEXT,`height`	INTEGER,`width`	INTEGER, `gallery_id`	INTEGER, FOREIGN KEY(`gallery_id`) REFERENCES `Galleries`(`id`));",
  createTableGalleries: "CREATE TABLE `Galleries` (`name`	TEXT,`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,`description`	TEXT, `parent_id`	INTEGER);",
  getGallery: "SELECT * FROM Galleries WHERE id = $id",
  getGalleryByName: "SELECT * FROM Galleries WHERE name = $name",
  postGallery: "INSERT INTO Galleries (name) VALUES ($name)",
  allGalleries: "SELECT Galleries.* From Galleries, Pictures where Galleries.id = Pictures.gallery_id group by Galleries.id;",
  deleteGallery: "DELETE FROM Galleries WHERE id =$id",
  updateGalleryParentId: "UPDATE Galleries SET parent_id = (SELECT id from Galleries WHERE name = $parentName) WHERE name = $galleryName;",
  getGalleriesList: (parent_id) => "SELECT * FROM Galleries WHERE parent_id == '" + parent_id + "';",
  allGalleriesLists: "SELECT * FROM Galleries WHERE parent_id is null AND id NOT IN (SELECT Galleries.id FROM Galleries, Pictures WHERE parent_id IS NULL AND Galleries.id = (SELECT id FROM Pictures) GROUP BY Galleries.id)"
}

export default queries
