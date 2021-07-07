export const handler = (_request, response) => {
    response.render("location-cleanup", {
        headTitle: "Location Cleanup"
    });
};
export default handler;
