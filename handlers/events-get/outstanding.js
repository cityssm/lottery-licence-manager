export const handler = (_request, response) => {
    response.render("event-outstanding", {
        headTitle: "Outstanding Events"
    });
};
export default handler;
