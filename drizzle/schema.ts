import { pgTable, bigint, text, doublePrecision, serial, date, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const deliveryDataClean = pgTable("delivery_data_clean", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }),
	nameOfCustomer: text("Name of Customer"),
	model: text("Model"),
	vinNo: text("Vin No."),
	suffix: text("Suffix"),
	colour: text("Colour"),
	paymentReceived: text("Payment Received"),
	dateOfDelivery: text("Date of Delivery"),
	location: text("Location"),
	so: text("SO"),
	remark: text("Remark"),
	rto: text("RTO"),
	permRegRto: text("Perm reg RTO"),
	documentsHandover: doublePrecision("Documents Handover"),
	tempReg: doublePrecision("Temp Reg"),
	permReg: text("Perm Reg"),
	refund: text("Refund"),
	pendingAccessories: text("Pending Accessories"),
	"1111Q": doublePrecision(),
	toyotaConnectApp: doublePrecision("Toyota Connect App"),
	deliveryMonth: text("delivery_month"),
});

export const deliveries = pgTable("deliveries", {
	id: serial().primaryKey().notNull(),
	customerName: text("customer_name"),
	model: text(),
	vinNo: text("vin_no"),
	suffix: text(),
	colour: text(),
	paymentReceived: text("payment_received"),
	deliveryDate: date("delivery_date"),
	deliveryMonth: text("delivery_month"),
	location: text(),
	salesOfficer: text("sales_officer"),
	remark: text(),
	rto: text(),
	permRegRto: integer("perm_reg_rto"),
	documentsHandover: integer("documents_handover"),
	tempReg: integer("temp_reg"),
	permReg: integer("perm_reg"),
	refund: integer(),
	pendingAccessories: integer("pending_accessories"),
	toyotaConnectApp: integer("toyota_connect_app"),
});
