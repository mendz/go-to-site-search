const fs = require('fs');
const AdmZip = require('adm-zip');

const zip = new AdmZip();

const files = ['manifest.json', 'popup.js', 'popup.html', 'popup-styles.css'];
const folders = ['./icons'];
const destZipPath = './build/go-to-site-search.zip';

if (fs.existsSync(destZipPath)) {
  console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              BUILD CLEANING
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);
  fs.unlinkSync(destZipPath);
  console.log(`'${destZipPath}' was deleted`);
}

console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              ZIP FILES
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

files.forEach((file) => {
  console.log(`'${file}'`);
  zip.addLocalFile(file);
});

console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              ZIP FOLDERS
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`);

folders.forEach((folder) => {
  console.log(`'${folder}'`);
  zip.addLocalFolder(folder, 'icons');
});

zip.writeZip(destZipPath, () =>
  console.log(`
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                  DONE!
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  OUTPUT: '${destZipPath}'
`)
);
