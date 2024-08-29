import {
  get_receipt_invoice_last_records_Url,
  get_sundry_debtors_indirect_incomes_Url,
  get_cashAc_bank_account_details_Url,
  create_receiptUrl,
  get_receipt_list_by_company_Url,
  deleteReceiptURL,
  get_receipt_by_idURL,
  update_receiptUrl,
} from "@/services/api";
import { getHeader } from "@/helpers";
import axios from "axios";

//Receipt
export function getReceiptLastRecords(requestData) {
  return axios({
    url: get_receipt_invoice_last_records_Url(),
    data: requestData,
    method: "GET",
    headers: getHeader(),
  });
}

export function getSundryDebtorsIndirectIncome(requestData) {
  return axios({
    url: get_sundry_debtors_indirect_incomes_Url(),
    data: requestData,
    method: "GET",
    headers: getHeader(),
  });
}

export function getCashACBankAccountDetails(requestData) {
  return axios({
    url: get_cashAc_bank_account_details_Url(),
    data: requestData,
    method: "GET",
    headers: getHeader(),
  });
}

export function create_receipts(requestData) {
  return axios({
    url: create_receiptUrl(),
    data: requestData,
    method: "POST",
    headers: getHeader(),
  });
}

export function getReceiptListByCompany() {
  return axios({
    url: get_receipt_list_by_company_Url(),
    method: "GET",
    headers: getHeader(),
  });
}

export function deleteReceipt(requestData) {
  return axios({
    url: deleteReceiptURL(),
    data: requestData,
    method: "POST",
    headers: getHeader(),
  });
}

export function get_receipt_by_id(requestData) {
  return axios({
    url: get_receipt_by_idURL(),
    data: requestData,
    method: "POST",
    headers: getHeader(),
  });
}

export function update_receipt(requestData) {
  return axios({
    url: update_receiptUrl(),
    data: requestData,
    method: "POST",
    headers: getHeader(),
  });
}
