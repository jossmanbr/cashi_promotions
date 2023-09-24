import PocketBase from "pocketbase";
import puppeteer from "puppeteer";


async function getPromoCashi() {
    const pb = new PocketBase(process.env.URL_POCKETBASE)
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto('https://cashi.com.mx/promociones/')

        // execute standard javascript in the context of the page.
        await page.waitForSelector('#promociones');
        const data = await page.$eval('#promociones', (div) => {
            let cards = div.querySelectorAll("div.promoPagePromotions");
            const allCards = [];
            cards.forEach(e => {
                const getCard = (element) => {
                    // Selecciona el elemento del DOM
                    let promoElement = element;

                    // Obtiene el src de la imagen
                    let srcImg = promoElement.querySelector('img').src;

                    // Obtiene el texto del elemento ".titlePostPromo"
                    let title = promoElement.querySelector('.titlePostPromo p').innerText;

                    // Obtiene el texto del primer y segundo párrafo del elemento ".extractPostPromo"
                    let extractTexts = promoElement.querySelectorAll('.extractPostPromo p');
                    let firstPText = extractTexts[0].innerText;
                    let secondPText = extractTexts[1].innerText;

                    // Obtiene el href de la etiqueta a
                    let linkHref = promoElement.querySelector('a').href;
                    return { srcImg, title, description: firstPText, vigencia: secondPText, termAdnCond: linkHref }

                }
                allCards.push(getCard(e))
            })
            return allCards;
        })
        await pb.collection("cashi_promotions").create({ promotions: JSON.stringify(data), auth: process.env.AUTH });
        await browser.close();
        
    } catch (error) {
        await pb.collection("log_cashi").create({ error: error.message, auth: process.env.AUTH});
    }
}
getPromoCashi()
