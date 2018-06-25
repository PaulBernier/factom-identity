function getNowTimestamp8BytesBuffer() {
    const timestamp = Buffer.alloc(8);
    timestamp.writeIntBE(parseInt(Date.now() / 1000), 2, 6);
    return timestamp;
}

module.exports = {
    getNowTimestamp8BytesBuffer
};
