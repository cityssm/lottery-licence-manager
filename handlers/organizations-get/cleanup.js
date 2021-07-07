export const handler = (_request, response) => {
    response.render("organization-cleanup", {
        headTitle: "Organization Cleanup"
    });
};
export default handler;
