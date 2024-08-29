import config from "config";

//Receipt
export function get_receipt_invoice_last_records_Url() {
  return `${config.apiUrl}/get_receipt_invoice_last_records`;
}

export function get_sundry_debtors_indirect_incomes_Url() {
  return `${config.apiUrl}/get_sundry_debtors_indirect_incomes`;
}

export function get_cashAc_bank_account_details_Url() {
  return `${config.apiUrl}/get_cashAc_bank_account_details`;
}

export function create_receiptUrl() {
  return `${config.apiUrl}/create_receipt`;
}

export function get_receipt_list_by_company_Url() {
  return `${config.apiUrl}/get_receipt_list_by_company`;
}

export function deleteReceiptURL() {
  return `${config.apiUrl}/delete_receipt`;
}

export function get_receipt_by_idURL() {
  return `${config.apiUrl}/get_receipt_by_id`;
}

export function update_receiptUrl() {
  return `${config.apiUrl}/update_receipt`;
}
