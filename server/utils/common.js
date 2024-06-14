/**
 * @public
 * @description  await manually built function
 */

exports.wait = async (newDb,query) => {
    return new Promise((resolve, reject) => {
      newDb.query(query, function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    }
  )}