'use strict';
const express = require('express');
const router = express.Router();
const {defaultResponse} = require('../../utils/helper');
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');

router.get('/*', async (req, res, next) => {
    try {
        const filePath = path.resolve(__dirname, '../' + req.path);
        const type = await fileType.fromFile(filePath);
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs.createReadStream(filePath, {start, end});
            console.log(file)
            const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": type.mime
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                "Content-Length": fileSize,
                "Content-Type": type.mime
            };
            res.writeHead(200, head);
            const file = fs.createReadStream(filePath);
            file.pipe(res);
        }
    }catch (e) {
        return defaultResponse(res, 404, 'Trang web không tồn tại.');
    }
});

module.exports = router;
