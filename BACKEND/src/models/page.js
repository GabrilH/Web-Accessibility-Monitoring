const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PageSchema = new Schema({
    url: { type: String, required: true },
    validationStatus: {
        type: String,
        enum: ['Por avaliar', 'Em avaliação', 'Conforme', 'Não Conforme', 'Erro na avaliação'],	
        default: 'Por avaliar',
        required: true
    },
    lastValidationDate: { type: Date, required: false },
    registrationDate: { type: Date, default: Date.now, required: true },
    report: { type: Object, required: false }
});

module.exports = mongoose.model('Page', PageSchema);