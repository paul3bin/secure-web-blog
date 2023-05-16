const db = require("./db.service");
const { PreparedStatement: PS } = require("pg-promise");

async function create(
  user_id,
  action,
  ipAddress,
  userAgent,
  additionalDetails,
  status
) {
  const insertAudit = new PS({
    name: "insert-audit",
    text: 'Insert into "DSS".tbl_audit_logs_data(user_id, action_performed, action_timestamp, ip_address, user_agent, additional_details, status) Values($1,$2,$3,$4, $5, $6, $7) ',
    values: [
      user_id,
      action,
      "now()",
      ipAddress,
      userAgent,
      additionalDetails,
      status,
    ],
  });

  const result = await db.callQuery(insertAudit);

  return result;
}

module.exports = {
  create,
};
