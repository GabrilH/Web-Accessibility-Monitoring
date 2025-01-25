const asyncHandler = require("express-async-handler");
const Website = require('../models/website');
const Page = require('../models/page');
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#()?&=]*)/;
const { QualWeb } = require('@qualweb/core');

exports.website_list = asyncHandler(async (req, res, next) => {
    try {
        const websites = await Website.find().exec();
            
        res.json(websites);
    } catch {
        res.json([]);
    }
});

exports.website_create = asyncHandler(async (req, res, next) => {

    const { url, validationStatus } = req.body;

    if (!urlRegex.test(url)) {
        return res.status(400).json('URL Inválido, exemplo de um URL válido: https://www.exemplo.com' );
    }

    const existingWebsite = await Website.findOne({ url });
    if (existingWebsite) {
        return res.status(400).json('Já existe um website com o mesmo URL');
    }

    const website = new Website({
        url: url,
        validationStatus: validationStatus,
    });

    await website.save();
    res.json(website);
});

exports.website_get = asyncHandler(async (req, res, next) => {
    try {
        const website = await Website.findById(req.params.id).exec();
        if (!website) {
            return res.status(404).json('Website não encontrado' );
        }

        res.json(website);
    } catch {
        res.json({});
    }
});

exports.website_delete = asyncHandler(async (req, res, next) => {
    try {
        
        const website = await Website.findByIdAndDelete(req.params.id).exec();
        if (!website) {
            return res.status(404).json('Website não encontrado');
        }

        await Page.deleteMany({ _id: { $in: website.pages } });

        res.json(website);
    } catch {
        res.status(500).json('Internal server error');
    }
});

exports.website_pages_list = asyncHandler(async (req, res, next) => {
    try {
        const website = await Website.findById(req.params.id).populate('pages').exec();
        if (!website) {
            return res.status(404).json('Website não encontrado' );
        }
        res.json(website.pages);
    } catch {
        res.json([]);
    }
});

exports.website_page_create = asyncHandler(async (req, res, next) => {
    try {

        const website = await Website.findById(req.params.id).populate('pages').exec()
        if (!website) {
            return res.status(404).json('Website não encontrado');
        }

        const { url, validationStatus } = req.body;

        if (!urlRegex.test(url)) {
            return res.status(400).json('URL Inválido, exemplo de um URL válido: https://www.exemplo.com');
        }

        const websiteDomain = new URL(website.url).hostname;
        const pageDomain = new URL(url).hostname;

        if (websiteDomain !== pageDomain) {
            return res.status(400).json('URL da página não pertence ao mesmo domínio do website');
        }

        const existingPage = await Page.findOne({ url });
        if (existingPage) {
            return res.status(400).json('Já existe uma página com o mesmo URL');
        }
        
        const page = new Page({url: url, validationStatus: validationStatus});
        await page.save();

        website.pages.push(page);
        website.validationStatus = calculateWebsiteStatus(website.pages);
        await website.save();
        
        res.json(page);
    } catch (error) {
        console.error('Error creating website page:', error);
        res.status(500).json('Internal server error');
    }
});

exports.website_page_get = asyncHandler(async (req, res, next) => {
    try {
        const website = await Website.findById(req.params.id).exec();
        if (!website) {
            return res.status(404).json('Website não encontrado');
        }
        
        //check if given pageid exists in the website
        const pageId = req.params.pageId;
        const pageExists = website.pages.some(page => page._id == pageId);
        if (!pageExists) {
            return res.status(404).json('Página não encontrada no website');
        }

        const page = await Page.findById(pageId).exec();
        if (!page) {
            return res.status(404).json('Página não encontrada');
        }

        res.json(page);
    } catch {
        res.json({});
    }
});

exports.website_page_delete = asyncHandler(async (req, res, next) => {
    try {

        const websiteId = req.params.id;
        const website = await Website.findById(websiteId).populate('pages').exec()
        if (!website) {
            return res.status(404).json('Website não encontrado');
        }

        //check if given pageid exists in the website
        const pageId = req.params.pageId;
        const pageExists = website.pages.some(page => page._id == pageId);
        if (!pageExists) {
            return res.status(404).json('Página não encontrada no website');
        }

        const page = await Page.findByIdAndDelete(pageId).exec();
        if (!page) {
            return res.status(404).json('Página não encontrada');
        }

        const newWebsite = await Website.findById(websiteId).populate('pages').exec()
        const newWebsiteStatus = calculateWebsiteStatus(newWebsite.pages);

        website.pages = website.pages.filter(page => page._id != pageId);
        website.validationStatus = calculateWebsiteStatus(website.pages);

        await Website.findByIdAndUpdate(req.params.id, { validationStatus: newWebsiteStatus }, { new: true }).exec();

        res.json(page);
    } catch {
        res.status(500).json('Internal server error');
    }
});

exports.website_page_update = asyncHandler(async (req, res, next) => {
    try {

        const websiteId = req.params.id;
        const website = await Website.findById(websiteId).populate('pages').exec()
        if (!website) {
            return res.status(404).json('Website não encontrado');
        }

        const pageId = req.params.pageId;
        const pageExists = website.pages.some(page => page._id == pageId);
        if (!pageExists) {
            return res.status(404).json('Página não encontrada no website');
        }

        const page = await Page.findById(pageId).exec();
        if (!page) {
            return res.status(404).json('Página não encontrada');
        }

        //check if given validationStatus is valid
        const { validationStatus } = req.body;
        if (validationStatus !== 'Por avaliar' && validationStatus !== 'Em avaliação' && validationStatus !== 'Erro na avaliação' && validationStatus !== 'Conforme' && validationStatus !== 'Não Conforme') {
            return res.status(400).json('Estado de validação inválido');
        }

        if(validationStatus === 'Em avaliação')
            page.report = null;

        page.validationStatus = validationStatus;
        await page.save();

        const newWebsite = await Website.findById(websiteId).populate('pages').exec()
        const newWebsiteStatus = calculateWebsiteStatus(newWebsite.pages);

        await Website.findByIdAndUpdate(req.params.id, { validationStatus: newWebsiteStatus }, { new: true }).exec();

        res.json({ message: 'Página atualizada com sucesso', page });
    } catch (error) {
        console.error('Erro ao atualizar a página do website:', error);
        res.status(500).json('Erro interno do servidor');
    }
});

exports.website_evaluate = asyncHandler(async (req, res) => {
    
    try {
        const website = await Website.findById(req.params.id).exec();
        if (!website) {
            return res.status(404).json('Website não encontrado');
        }

        let { pageIds } = req.body;
        let reports = [];

        // Options for the QualWeb evaluator
        const plugins = {
            adBlock: false, // Default value = false
            stealth: true // Default value = false
        };
        const clusterOptions = {
            timeout: 30 * 1000, // Timeout for loading page. Default value = 30 seconds
        };
        const launchOptions = {
            args: ['--no-sandbox', '--ignore-certificate-errors']
        };

        // Criar instância do avaliador
        const qualweb = new QualWeb(plugins);

        // Iniciar o avalidor
        await qualweb.start(clusterOptions, launchOptions);
        console.log('QualWeb started successfully');

        // Change website status to 'Em avaliação'
        await Website.findByIdAndUpdate(req.params.id, { validationStatus: 'Em avaliação'}, { new: true }).exec();

        for (let pageId of pageIds) {
            // Find the page by ID
            const page = await Page.findById(pageId).exec();
            if (!page) {
                console.error('Página não encontrada');
                continue;
            }

            // Change page status to 'Em avaliação'
            await Page.findByIdAndUpdate(pageId, { validationStatus: 'Em avaliação', lastValidationDate: Date.now() }, { new: true }).exec();

            const qualwebOptions = {
                url: page.url
            };

            // Execute the accessibility evaluation and receive the report
            console.log('Evaluating page:', page.url);
            const report = await qualweb.evaluate(qualwebOptions);
            if (!report) {
                // Change page status to 'Erro na avaliação'
                await Page.findByIdAndUpdate(pageId, { validationStatus: 'Erro na avaliação', lastValidationDate: Date.now() }, { new: true }).exec();
                continue;
            }
            
            // Save the evaluation report in the reports array
            reports.push(report);

            const newPageStatus = calculatePageStatus(report[page.url]);
            await Page.findByIdAndUpdate(pageId, { validationStatus: newPageStatus, lastValidationDate: Date.now(), report: report[page.url] }, { new: true }).exec();
        }

        // Stop the QualWeb evaluator
        await qualweb.stop();

        const newWebsite = await Website.findById(website._id).populate('pages').exec()
                
        const newWebsiteStatus = calculateWebsiteStatus(newWebsite.pages);

        let newLastValidationDate = ''
        if (newWebsiteStatus === 'Avaliado')
            newLastValidationDate = Date.now()

        await Website.findByIdAndUpdate(req.params.id, { validationStatus: newWebsiteStatus, lastValidationDate: newLastValidationDate }, { new: true }).exec();

        // Return the evaluation reports
        res.json(reports);
    } catch {
        // Change website status to 'Erro na avaliação'
        await Website.findByIdAndUpdate(req.params.id, { validationStatus: 'Erro na avaliação', lastValidationDate: Date.now() }, { new: true }).exec();

        res.status(500).json('Internal server error');
    }
});

function calculateWebsiteStatus(pages) {

    console.log("Calculating website status")
    let porAvaliar = 0
    let emAvaliacao = 0
    let erroNaAvaliacao = 0
    let avaliado = 0
    pages.forEach(page => {
        switch (page.validationStatus) {
            case 'Por avaliar':
                porAvaliar++;
                break;
            case 'Em avaliação':
                emAvaliacao++;
                break;
            case 'Erro na avaliação':
                erroNaAvaliacao++;
                break;
            case 'Conforme':
                avaliado++;
                break;
            case 'Não Conforme':
                avaliado++;
                break;
        }
    });

    let newWebsiteStatus = 'Em avaliação';
    if (erroNaAvaliacao > 0)
        newWebsiteStatus = 'Erro na avaliação';
    else if (pages.length === 0 || pages.length === porAvaliar)
        newWebsiteStatus = 'Por avaliar';
    else if (avaliado === pages.length)
        newWebsiteStatus = 'Avaliado';
    
    return newWebsiteStatus;
}

function calculatePageStatus (report) {

    console.log("Calculating page status")
    // If there are no failed rules, the page is 'Conforme'
    const failedActRules = report.modules['act-rules']['metadata'].failed;
    const failedWCAGTechniques = report.modules['wcag-techniques']['metadata'].failed;
    if (failedActRules === 0 && failedWCAGTechniques === 0) {
        return 'Conforme';
    }

    // If there are failed rules, let's check if they are from level A or AA
    // Iterate through act-rules
    const modules = ['act-rules', 'wcag-techniques']
    for (const module of modules) {

        const rules = report.modules[module]['assertions'];
        for (const ruleId in rules) {

            if (!Object.hasOwn(rules, ruleId))
                continue;

            const metadata = rules[ruleId]['metadata'];

            const failed = metadata.failed;
            if (failed <= 0)
                continue;

            const successCriteria = metadata['success-criteria'];
            for (let sc of successCriteria) {
                if (sc.level === 'A' || sc.level === 'AA') {
                    return 'Não Conforme';
                }
            }
        }
    }

    return 'Conforme';
}
