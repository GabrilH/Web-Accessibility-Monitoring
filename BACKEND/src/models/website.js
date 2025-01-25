const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    url: { type: String, required: true },
    validationStatus: {
        type: String,
        enum: ['Por avaliar', 'Em avaliação', 'Avaliado', 'Erro na avaliação'],
        default: 'Por avaliar',
        required: true
    },
    pages: [{ type: Schema.Types.ObjectId, ref: 'Page', required: false }],
    registrationDate: { type: Date, default: Date.now, required: true },
    lastValidationDate: { type: Date, required: false }
});

module.exports = mongoose.model('Website', WebsiteSchema);