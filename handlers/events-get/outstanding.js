export default function handler(_request, response) {
    response.render('event-outstanding', {
        headTitle: 'Outstanding Events'
    });
}
