import * as mongoose from 'mongoose';

const EncryptedDataSchema = new mongoose.Schema({
    originalText: { type: String, required: true },
    encryptedText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Esta línea asegura que el modelo no se redefina si el servidor recarga.
export const EncryptedData = (mongoose.models['EncryptedData'] || 
    mongoose.model('EncryptedData', EncryptedDataSchema));