import pool from "../utils/db.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const getAllCity = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const query = "SELECT * FROM data WHERE userId = ?";
  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error checking existing user:", err);
      return next(new AppError("Database query failed", 500));
    }
    res.status(200).json({
      status: "success",
      data: results,
    });
  });
});

const getCityById = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const id = req.params.id;

  const query = "SELECT * FROM data WHERE userId = ? AND id = ?";
  pool.query(query, [userId, id], (err, results) => {
    if (err) {
      console.error("Error checking existing user:", err);
      return next(new AppError("Database query failed", 500));
    }
    res.status(200).json({
      status: "success",
      data: results,
    });
  });
});

const create = catchAsync(async (req, res, next) => {
  const { cityName, country, emoji, notes, lat, lng } = req.body;
  const userId = req.user.id;

  const insertQuery =
    "INSERT INTO data (cityName, country, emoji, date, notes, lat, lng, userId) VALUES (? , ? , ? , ?, ?, ? , ? ,?)";

  pool.query(
    insertQuery,
    [cityName, country, emoji, new Date(), notes, lat, lng, userId],
    (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return next(new AppError("Database query failed", 500));
      }
      const id = results.insertId;
      const searchQuery = "SELECT * FROM data WHERE id = ?";
      pool.query(searchQuery, [id], (err, results) => {
        if (err) {
          console.error("Error checking existing user:", err);
          return next(new AppError("Database query failed", 500));
        }
        res.status(200).json({
          status: "success",
          data: results[0],
        });
      });
    }
  );
});

const removeCity = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  const deleteQuery = "DELETE FROM data WHERE id = ?";

  pool.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error("Error checking existing user:", err);
      return next(new AppError("Database query failed", 500));
    }
    res.status(200).json({
      status: "success",
    });
  });
});

export default { getAllCity, getCityById, create, removeCity };
