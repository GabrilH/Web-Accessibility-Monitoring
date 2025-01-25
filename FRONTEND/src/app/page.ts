export interface Page {
    _id: string;
    url: string;
    validationStatus: 'Por avaliar' | 'Em avaliação' | 'Conforme' | 'Não Conforme' | 'Erro na avaliação';
    lastValidationDate?: Date;
    registrationDate: Date;
    report?: object;
}