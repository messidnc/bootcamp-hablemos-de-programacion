const router = require("express").Router();
const Veterinaria = require("./schema");


const {
  listar,
  obtenerUno,
  crear,
  actualizar,
  eliminar,
  filtrarEntidades,
} = require("../genericos");

const listarHandler = listar({ Modelo: Veterinaria });
router.get("/", listarHandler);

const obtenerUnoHandler = obtenerUno({ Modelo: Veterinaria });
router.get("/:_id", obtenerUnoHandler);

const crearHandler = crear({ Modelo: Veterinaria });
router.post("/", crearHandler);

//const editarHandler = actualizar(entidad);

router.put("/:_id", async (req, res) => {
  try {
    const { _id = null } = req.params;
    const { _id: id, ...datosNuevos } = req.body;
    if (!_id) {
      return res.status(400).json({ mensaje: "falta id" });
    }
    const veterinariaActualizada = await Veterinaria.findOneAndUpdate(
      { _id },
      { $set: datosNuevos },
      { new: true, runValidators: true }
    );
    return res.status(200).json(veterinariaActualizada);
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ mensaje: error.message });
  }
});

// const eliminarHandler = eliminar(entidad);
router.delete("/:_id", async (req, res) => {
  try {
    const { _id = null } = req.params;
    if (!_id) {
      return res.status(400).json({ mensaje: "falta id" });
    }
    const resultado = await Veterinaria.remove({_id});
    if  (resultado.deletedCount === 1) {
      return res.status(204).send();
    }
    return res
      .status(500)
      .json({ mensaje: "no se pudo eliminar el recurso, vuelva a intentar" });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ mensaje: error.message });
  }
});

module.exports = router;
