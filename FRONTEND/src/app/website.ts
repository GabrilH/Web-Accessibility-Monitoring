import { Page } from './page';

export interface Website {
    _id: string;
    url: string;
    validationStatus: string;
    pages: Page[];
    registrationDate: Date;
    lastValidationDate: Date;
}