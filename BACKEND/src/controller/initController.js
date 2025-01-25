const asyncHandler = require("express-async-handler");
const Website = require("../models/website");
const Page = require("../models/page");
const mongoose = require("mongoose");

exports.init = asyncHandler(async (req, res, next) => {
    await populateDb();
    res.status(200).send({ message: "Database populated" });
});

async function populateDb() {
    await deleteDb();
    await createWebsitesAndPages();
}

async function deleteDb() {
    await mongoose.connection.collections["websites"].drop();
    await mongoose.connection.collections["pages"].drop();
}

async function createWebsitesAndPages() {
    await Promise.all([
        websiteCreateAndPages("https://www.google.com", 'Avaliado', [
            { url: "https://www.google.com/about", status: "Conforme"},
            { url: "https://www.google.com/contact", status: "Conforme"},
        ]),
        websiteCreateAndPages("https://fenix.ciencias.ulisboa.pt", "Erro na avaliação", [
            { url: "https://fenix.ciencias.ulisboa.pt/student", status: "Erro na avaliação"},
            { url: "https://fenix.ciencias.ulisboa.pt/candidate", status: "Erro na avaliação"},
        ]),
        websiteCreateAndPages("https://www.minecraft.com.br", "Avaliado", [
            { url: "https://www.minecraft.com.br/stealaccount", status: "Não Conforme"},
            { url: "https://www.minecraft.com.br/stealcreditcard", status: "Conforme"},
        ]),
        websiteCreateAndPages("https://olivais.pt", "Por avaliar" , [
            { url: "https://olivais.pt/valedosilencio", status: "Por avaliar"},
            { url: "https://olivais.pt/ruacidadedabeira", status: "Erro na avaliação"},
        ]),
    ]);
}

async function websiteCreateAndPages(websiteURL, websiteStatus, pagesInfo) {

    const websiteRegistrationDate = generateRandomDate();
    const webstiteValDate = websiteStatus === 'Avaliado' ? generateRandomDate(websiteRegistrationDate) : null;

    const website = await websiteCreate(websiteURL, websiteStatus, webstiteValDate, websiteRegistrationDate);

    await Promise.all(
        pagesInfo.map(async ({ url, status }) => {
            const pageRegistrationDate = generateRandomDate(websiteRegistrationDate, webstiteValDate);
            const pageValDate = status === 'Conforme' || status === 'Não Conforme' ? generateRandomDate(pageRegistrationDate, webstiteValDate) : null;
            const page = await pageCreate(url, status, pageValDate, pageRegistrationDate);
            website.pages.push(page);
        }),
    );

    await website.save();
}

async function websiteCreate(websiteURL, websiteStatus, valDate, registrationDate) {
    const website = new Website({
        url: websiteURL,
        validationStatus: websiteStatus,
        registrationDate: registrationDate,
    });

    if (valDate !== null) {
        website.lastValidationDate = valDate;
    }

    await website.save();
    console.log("Website created: " + websiteURL);
    return website;
}

async function pageCreate(pageURL, pageStatus, lastValidationDate, registrationDate) {
    const page = new Page({ url: pageURL, validationStatus: pageStatus, registrationDate : registrationDate });
    if (pageStatus !== 'Por avaliar' && lastValidationDate) {
        page.lastValidationDate = lastValidationDate;
    }
    await page.save();
    console.log("Page created: " + pageURL);
    return page;
}

function generateRandomDate(startDate = new Date(2000, 0, 1), endDate = Date.now()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate;
}
