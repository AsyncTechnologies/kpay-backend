const emailExistence = require('email-existence');

module.exports = (email) => {
    return new Promise((resolve, reject) => {
        emailExistence.check(email, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};