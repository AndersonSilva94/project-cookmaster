const path = require('path');
const multer = require('multer');

// Ajuda de Lucas Godoi - Turma 10 Tribo A
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (request, file, callback) => {
    const { id } = request.params;
    const nameFile = `${id}.jpeg`;
    callback(null, nameFile);
  },
});

/* const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
}); */

const upload = multer({ storage });

module.exports = upload;
