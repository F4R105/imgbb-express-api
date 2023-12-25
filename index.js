const express = require('express')
const app = express()
const multer = require('multer');
const cors = require('cors')

require('dotenv').config()

// Create a multer instance with a memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 5 } });

app.use(cors())
app.use(express.json())
app.use(express.static('public'))


app.post('/', upload.array('images'), async (req, res) => {

  if (req.files && req.files.length > 0) {

    const key = process.env.IMGBB_API_KEY;
    const imageUrls = [];

    for (let file of req.files) {
      // Get the file buffer
      const buffer = file.buffer;

      // Create a form data object
      const data = new FormData();
      data.append('key', key);
      data.append('image', Buffer.from(buffer).toString('base64'));

      try {
        const response = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: data,
        });

        const json = await response.json();

        console.log(json)

        if (json.status === 200) {
          imageUrls.push(json.data.url);
        } else {
          return res.send(json.error.message);
        }
      } catch (error) {
        console.error(error);
        return res.status(500).send('Something went wrong');
      }
    }

    res.json({imageUrls});
  } else {
    res.status(400).send('Please provide image files');
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, console.log('Server is listening on port ', PORT))
