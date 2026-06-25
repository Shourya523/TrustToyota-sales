import {
    pgTable,
    serial,
    text,
    integer,
    date,
} from "drizzle-orm/pg-core"

export const deliveries = pgTable("deliveries", {
    id: serial("id").primaryKey(),
    customerName: text("customer_name"),
    model: text("model"),
    vinno: text("vin_no"),
    suffix: text("suffix"),
    colour: text("colour"),

    paymentReceived: text("payment_received"),

    deliveryDate: date("delivery_date"),
    deliveryMonth: text("delivery_month"),

    location: text("location"),
    salesOfficer: text("sales_officer"),

    remark: text("remark"),
    rto: text("rto"),

    permRegRto: integer("perm_reg_rto"),

    documentsHandover: integer("documents_handover"),
    tempReg: integer("temp_reg"),
    permReg: integer("perm_reg"),
    refund: integer("refund"),
    pendingAccessories: integer("pending_accessories"),
    toyotaConnectApp: integer("toyota_connect_app"),
})