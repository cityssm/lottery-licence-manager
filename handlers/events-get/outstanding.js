export const handler = (_req, res) => {
    res.render("event-outstanding", {
        headTitle: "Outstanding Events"
    });
};
export default handler;
