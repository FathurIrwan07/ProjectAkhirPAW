const router = require("express").Router();
const todosController = require("../controllers/controller-todo");
const verifyUser = require("../configs/verify");

// Rute untuk mengelola data Vespa (atau data Todos, sesuaikan dengan aplikasi Anda)
router.get("/", verifyUser.isLogin, todosController.getTodos); // Menampilkan semua data Todos (film)
router.post("/save", verifyUser.isLogin, todosController.saveTodos); // Menyimpan data Todos (film)
router.get("/edit/:id", verifyUser.isLogin, todosController.editTodos); // Halaman edit Todos (film)
router.post("/update/:id", verifyUser.isLogin, todosController.updateTodos); // Memperbarui data Todos (film)
router.get("/delete/:id", verifyUser.isLogin, todosController.deleteTodos); // Menghapus data Todos (film)

module.exports = router;
