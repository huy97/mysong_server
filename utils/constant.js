const SALT_ROUND = 10;

const PERMISSION_CODE = {
    READ: "READ",
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
    MANAGER: "MANAGER"
};

const MEDIA_TYPE = {
    AUDIO: "AUDIO",
    VIDEO: "VIDEO",
    IMAGE: "IMAGE",
    OTHER: "OTHER",
};

module.exports = {
    SALT_ROUND,
    PERMISSION_CODE,
    MEDIA_TYPE
};
