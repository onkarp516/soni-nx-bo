import React, { Component, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import moment from "moment";
import {
    Input,
    FormFeedback,
    Row,
    Col,
    Spinner,
    FormGroup,
    Label,
    Button,
    Card,
    CardBody,
    CardTitle,
    Table, // CardHeader,
} from "reactstrap";
import {
    WithUserPermission,
    isActionExist,
    MyDatePicker,
    checkInvoiceDateIsBetweenFYFun,
    getSelectValue,
} from "@/helpers";
import Select from "react-select";
import {
    AuthenticationCheck,
    getPOPendingOrderWithIds,
    getReceiptLastRecords,
    getSundryDebtorsIndirectIncome,
    getdebtorspendingbills,
    getCashACBankAccountDetails,
    create_receipts,
} from "@/services/api_function";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const ClearIndicatorStyles = (base, state) => ({
    ...base,
    cursor: "pointer",
    color: state.isFocused ? "blue" : "black",
});

const typeOpts = [
    { label: "Dr", value: "dr", type: "dr" },
    { label: "Cr", value: "cr", type: "cr" },
];

class CreateReceipt extends Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.invoiceDateRef = React.createRef();
        this.state = {
            isLoading: false,
            show: false,
            invoice_data: "",
            amtledgershow: false,
            onaccountmodal: false,
            billadjusmentmodalshow: false,
            billadjusmentDebitmodalshow: false,
            bankledgershow: false,
            isDisabled: false,
            bankchequeshow: false,
            isAllCheckeddebit: false,
            sundryindirect: [],
            cashAcbankLst: [],
            purchaseAccLst: [],
            supplierNameLst: [],
            supplierCodeLst: [],
            selectedBillsdebit: [],
            selectedBillsCredit: [],
            billLst: [],
            billLstSc: [],
            selectedBills: [],
            accountLst: [],
            invoiceedit: false,
            adjusmentbillmodal: false,
            createproductmodal: false,
            pendingordermodal: false,
            pendingorderprdctsmodalshow: false,
            productLst: [],
            unitLst: [],
            rows: [],
            serialnopopupwindow: false,

            serialnoshowindex: -1,
            serialnoarray: [],
            lstDisLedger: [],
            additionalCharges: [],
            lstAdditionalLedger: [],
            additionalChargesTotal: 0,
            taxcal: { igst: [], cgst: [], sgst: [] },
            isAllChecked: false,
            selectedProductDetails: [],
            selectedPendingOrder: [],
            purchasePendingOrderLst: [],
            selectedPendingChallan: [],
            initVal: {
                receipt_sr_no: 1,
                receipt_code: "",
                transaction_dt: moment(new Date()).format("DD/MM/YYYY"),
                po_sr_no: 1,
                sundryindirectid: "",
                id: "",
                type: "",
                balancing_method: "",
                amount: "",
            },

            voucher_edit: false,
            voucher_data: {
                voucher_sr_no: 1,
                transaction_dt: moment(new Date()).format("DD-MM-YYYY"),
                payment_dt: moment(new Date()).format("DD-MM-YYYY"),
            },
            rows: [],
            sundryCreditorLst: [],
            cashAccLedgerLst: [],
            lstSundryCreditorsPayment: [],

            index: 0,
            crshow: false,
            onaccountcashaccmodal: false,
            bankaccmodal: false,
        };
    }

    handleChangeArrayElement = (element, value, index) => {
        // debugger;
        let debitBal = 0;
        let creditBal = 0;
        console.log({ element, value, index });
        let { rows } = this.state;
        console.log("rows>>>>", rows);
        let debitamt = 0;
        let creditamt = 0;
        let frows = rows.map((v, i) => {
            // console.log("v-type => ", v["type"]);
            // console.log("i => ", { v, i });
            if (v["type"]["value"] == "cr") {
                debitamt = parseFloat(debitamt) + parseFloat(v["paid_amt"]);
                // bal = parseFloat(bal);
                if (v["paid_amt"] != "")
                    debitBal = debitBal + parseFloat(v["paid_amt"]);
                // console.log('bal', bal);
            } else if (v["type"]["value"] == "dr") {
                if (v["credit"] != "" && !isNaN(v["credit"]))
                    creditBal = creditBal + parseFloat(v["credit"]);
            }
            if (i == index) {
                if (element == "debit") {
                    v["paid_amt"] = value;
                    console.log("Dr value", value);
                } else if (element == "credit") {
                    v["paid_amt"] = value;
                    console.log("cr value", value);
                }
                v[element] = value;
                return v;
            } else {
                return v;
            }
        });

        console.log("debitBal, creditBal ", { debitBal, creditBal });
        let lastCrBal = debitBal - creditBal;
        console.log("lastCrBal ", lastCrBal);

        console.log("frows", { frows });

        if (element == "perticulars") {
            let obj = frows.find((v, i) => i == index);

            if (obj.type.value == "cr") {
                // this.FetchPendingBills(
                //   obj.perticulars.id,
                //   obj.perticulars.type,
                //   obj.perticulars.balancing_method
                // );
            } else if (obj.type.value == "dr") {
                console.log("obj", obj);
                frows = rows.map((vi, ii) => {
                    if (ii == index) {
                        // (lastCrBal = lastCrBal - vi['paid_amt']),
                        vi["credit"] = lastCrBal;
                        console.log("vi", vi);
                    }
                    return vi;
                });
                if (obj.perticulars.type == "others") {
                } else if (obj.perticulars.type == "bank_account") {
                    this.setState({ bankaccmodal: true });
                }
            }
        }
        console.log("frows", { frows });

        this.setState({ rows: frows, index: index });
    };

    getTotalDebitAmt = () => {
        let { rows } = this.state;
        let debitamt = 0;
        rows.map((v) => {
            if (v.type.value == "cr") {
                debitamt = parseFloat(debitamt) + parseFloat(v["paid_amt"]);
            }
        });
        return isNaN(debitamt) ? 0 : debitamt;
    };
    getTotalCreditAmt = () => {
        let { rows } = this.state;
        // console.log("Total Credit ", rows);
        let creditamt = 0;
        rows.map((v) => {
            if (v.type.value == "dr") {
                creditamt = parseFloat(creditamt) + parseFloat(v["credit"]);
            }
        });
        return isNaN(creditamt) ? 0 : creditamt;
    };

    initRows = () => {
        let rows = [];
        for (let index = 0; index < 10; index++) {
            let innerrow = {
                type: "",
                perticulars: "",
                paid_amt: "",
                bank_payment_type: "",
                bank_payment_no: "",
                debit: "",
                credit: "",
                narration: "",
            };
            if (index == 0) {
                // innerrow["type"] = "cr";
                innerrow["type"] = getSelectValue(typeOpts, "cr");
            }
            rows.push(innerrow);
        }
        this.setState({ rows: rows });
    };

    setElementValue = (element, index) => {
        let elementCheck = this.state.rows.find((v, i) => {
            return i == index;
        });
        return elementCheck ? elementCheck[element] : "";
    };
    getElementObject = (index) => {
        let elementCheck = this.state.rows.find((v, i) => {
            return i == index;
        });
        return elementCheck ? elementCheck : "";
    };

    handleClearPayment = (index) => {
        const { rows } = this.state;
        let frows = [...rows];
        let data = {
            // type: "",
            paid_amt: "",
            perticulars: "",
            credit: "",
            debit: "",
            bank_payment_type: "",
            bank_payment_no: "",
        };
        frows[index] = data;
        this.setState({ rows: frows }, () => { });
    };

    setreceiptlastrecords = () => {
        getReceiptLastRecords()
            .then((response) => {
                let res = response.data;
                if (res.responseStatus == 200) {
                    const { initVal } = this.state;
                    //initVal['payment_sr_no'] = res.count;
                    initVal["receipt_sr_no"] = res.receipt_sr_no;
                    initVal["receipt_code"] = res.receipt_code;

                    console.log({ initVal });
                    this.setState({ initVal: initVal });
                }
            })
            .catch((error) => {
                console.log("error", error);
            });
    };

    lstgetsundrydebtors_indirectexpenses = () => {
        getSundryDebtorsIndirectIncome()
            .then((response) => {
                console.log("response", response);
                let res = response.data ? response.data : [];
                let resLst = [];

                if (res.responseStatus == 200) {
                    if (res.list.length > 0) {
                        res.list.map((v) => {
                            let innerrow = {
                                id: v.id,
                                //ledger_id: v.ledger_id,
                                type: v.type,
                                ledger_name: v.ledger_name,
                                balancing_method: v.balancing_method,
                                value: v.id,
                                label: v.ledger_name,
                            };
                            resLst.push(innerrow);
                        });
                    }
                    this.setState({ sundryCreditorLst: resLst });
                }
            })
            .catch((error) => {
                console.log("error", error);
            });
    };
    lstgetcashAcbankaccount = () => {
        getCashACBankAccountDetails()
            .then((response) => {
                let res = response.data ? response.data : [];
                let resLst = [];

                if (res.responseStatus == 200) {
                    if (res.list.length > 0) {
                        res.list.map((v) => {
                            let innerrow = {
                                id: v.id,
                                type: v.type,
                                value: v.id,
                                label: v.name,
                                billids: [],
                            };
                            resLst.push(innerrow);
                        });
                    }
                    this.setState({ cashAcbankLst: resLst });
                }
            })
            .catch((error) => {
                console.log("error", error);
            });
    };

    getCurrentOpt = (index) => {
        let { rows, sundryCreditorLst, cashAcbankLst } = this.state;

        // console.log({ sundryCreditorLst });
        // console.log({ cashAcbankLst });
        let currentObj = rows.find((v, i) => i == index);
        console.log("currentObject", currentObj);
        if (currentObj.type.value == "cr") {
            return sundryCreditorLst;
        } else if (currentObj.type.value == "dr") {
            return cashAcbankLst;
        }
        return [];
    };

    FetchPendingBills = (id, type, balancing_method) => {
        console.log("balancing_method", balancing_method);
        let reqData = new FormData();
        reqData.append("ledger_id", id);
        reqData.append("type", type);
        reqData.append("balancing_method", balancing_method);
        getdebtorspendingbills(reqData)
            .then((response) => {
                let res = response.data;
                console.log("Res Bill List ", res);
                if (res.responseStatus == 200) {
                    let data = res.list;
                    console.log("data", data);
                    if (data.length > 0) {
                        if (balancing_method === "bill-by-bill" && type === "SD") {
                            //console.log('OPT', opt);
                            this.setState({ billLst: data, billadjusmentmodalshow: true });
                        } else if (balancing_method === "bill-by-bill" && type === "SC") {
                            this.setState({
                                billLstSc: data,
                                billadjusmentDebitmodalshow: true,
                            });
                        } else if (balancing_method === "on-account") {
                            this.setState({
                                billLst: data,
                                onaccountmodal: true,
                            });
                        }
                    }
                }
            })
            .catch((error) => {
                console.log("error", error);
                this.setState({ billLst: [] });
            });
    };

    componentDidMount() {
        // console.log("In A Receipt Creating Page");
        this.setreceiptlastrecords();
        this.lstgetsundrydebtors_indirectexpenses();
        this.lstgetcashAcbankaccount();

        this.initRows();
    }

    render() {
        const { isLoading, initVal, rows } = this.state;

        return (
            <div className="emp">
                <Card>
                    <CardBody className="border-bottom p-2">
                        <CardTitle>Create Receipt</CardTitle>

                        <div>
                            <Formik
                                validateOnBlur={false}
                                validateOnChange={false}
                                initialValues={initVal}
                                validationSchema={Yup.object().shape({
                                    receipt_sr_no: Yup.string()
                                        .trim()
                                        .required("Receipt  no is required"),
                                    transaction_dt: Yup.string().required(
                                        "Transaction date is required"
                                    ),
                                    sundryindirectid: Yup.string().required().value,
                                })}
                                onSubmit={(values, { resetForm, setStatus, setSubmitting }) => {
                                    console.log("i am in")
                                    this.setState({
                                        isLoading: true,
                                    });
                                    setStatus();
                                    if (
                                        this.getTotalDebitAmt() == this.getTotalCreditAmt() &&
                                        this.getTotalCreditAmt() > 0 &&
                                        this.getTotalDebitAmt() > 0
                                    ) {
                                        let data;
                                        console.log("values--------", values);
                                        let requestData = new FormData();
                                        this.setState({
                                            invoice_data: values,
                                        });

                                        let filterRow = rows.filter((v) => {
                                            if (v.bank_payment_type != "") {
                                                v.bank_payment_type = v.bank_payment_type.value;
                                            }
                                            return v;
                                        });
                                        // if (creditamt == debitamt) {
                                        let frow = filterRow.filter((v) => v.type != "");
                                        let formData = new FormData();

                                        console.log("frow >>>>>>>>>>>>>>>>>>>>>>>>", { frow });
                                        frow = frow.map((v, i) => {
                                            if (
                                                v.perticulars &&
                                                v.perticulars.balancing_method == "bill-by-bill"
                                            ) {
                                                let billRow = [];
                                                v.perticulars &&
                                                    v.perticulars.billids &&
                                                    v.perticulars.billids.map((vi, ii) => {
                                                        if ("paid_amt" in vi && vi["paid_amt"] > 0) {
                                                            billRow.push(vi);
                                                            // return vi;
                                                        } else if (
                                                            "credit_paid_amt" in vi &&
                                                            vi["credit_paid_amt"] > 0
                                                        ) {
                                                            // return vi;
                                                            billRow.push({
                                                                invoice_id: vi.credit_note_id,
                                                                amount: vi.Total_amt,

                                                                invoice_date: moment(
                                                                    vi.credit_note_date
                                                                ).format("YYYY-MM-DD"),
                                                                invoice_no: vi.credit_note_no,
                                                                source: vi.source,
                                                                paid_amt: vi.credit_paid_amt,
                                                                remaining_amt: vi.credit_remaining_amt,
                                                            });
                                                        } else if (
                                                            "debit_paid_amt" in vi &&
                                                            vi["debit_paid_amt"] > 0
                                                        ) {
                                                            // return vi;
                                                            billRow.push({
                                                                invoice_id: vi.debit_note_id,
                                                                amount: vi.Total_amt,

                                                                invoice_date: moment(vi.debit_note_date).format(
                                                                    "YYYY-MM-DD"
                                                                ),
                                                                invoice_no: vi.debit_note_no,
                                                                source: vi.source,
                                                                paid_amt: vi.debit_paid_amt,
                                                                remaining_amt: vi.debit_remaining_amt,
                                                            });
                                                        }
                                                    });

                                                console.log("billRow", JSON.stringify(billRow));
                                                let perObj = {
                                                    id: v.perticulars.id,
                                                    type: v.perticulars.type,
                                                    ledger_name: v.perticulars.ledger_name,
                                                    balancing_method: v.perticulars.balancing_method,
                                                    billids: billRow,
                                                };
                                                return {
                                                    type: v.type,
                                                    paid_amt: v.paid_amt,
                                                    perticulars: perObj,
                                                };
                                            } else if (
                                                v.perticulars &&
                                                v.perticulars.balancing_method == "on-account"
                                            ) {
                                                let perObj = {
                                                    id: v.perticulars.id,
                                                    type: v.perticulars.type,
                                                    ledger_name: v.perticulars.ledger_name,
                                                    balancing_method: v.perticulars.balancing_method,
                                                };
                                                return {
                                                    type: v.type.value,
                                                    paid_amt: v.paid_amt,
                                                    perticulars: perObj,
                                                };
                                            } else {
                                                let perObj = {
                                                    id: v.perticulars.id,
                                                    type: v.perticulars.type,
                                                    ledger_name: v.perticulars.label,
                                                };
                                                return {
                                                    type: v.type.value,
                                                    paid_amt: v.credit,
                                                    bank_payment_type: v.bank_payment_type,
                                                    bank_payment_no: v.bank_payment_no,
                                                    perticulars: perObj,
                                                };
                                            }
                                        });
                                        console.log("frow ---------", frow);

                                        var filtered = frow.filter(function (el) {
                                            return el != null;
                                        });
                                        formData.append("row", JSON.stringify(frow));
                                        console.log("Data row ", JSON.stringify(frow));
                                        // formData.append('rows', JSON.stringify(frow));
                                        console.log("rows", rows);
                                        formData.append(
                                            "transaction_dt",
                                            moment().format("yyyy-MM-DD")
                                        );
                                        console.log(
                                            "custName Name",
                                            values.ledger_name && values.ledger_name != ""
                                                ? values.ledger_name
                                                : null
                                        );
                                        formData.append("custName", values.ledger_name);
                                        formData.append("receipt_sr_no", values.receipt_sr_no);
                                        formData.append("receipt_code", values.receipt_code);
                                        let total_amt = this.getTotalDebitAmt();
                                        formData.append("total_amt", total_amt);

                                        if (values.narration != null) {
                                            formData.append("narration", values.narration);
                                        }
                                        // console.log(formData);
                                        for (var pair of formData.entries()) {
                                            console.log(pair[0] + ", " + pair[1]);
                                        }

                                        create_receipts(formData)
                                            .then((response) => {
                                                let res = response.data;
                                                if (res.responseStatus == 200) {
                                                    toast.success("✔" + res.message);
                                                    setSubmitting(false);
                                                    resetForm();
                                                    this.initRows();
                                                    this.props.history.push("/receipt");
                                                } else {
                                                    setSubmitting(false);
                                                    if (response.responseStatus == 409) {
                                                        toast.error("✘ Please Select Ledger First");
                                                    } else {
                                                        toast.error("✘ Please Select Ledger First");
                                                    }
                                                }
                                            })
                                            .catch((error) => {
                                                console.log("error", error);
                                            });
                                    } else {
                                    }
                                }}
                                render={({
                                    errors,
                                    status,
                                    touched,
                                    isSubmitting,
                                    handleChange,
                                    handleSubmit,
                                    setFieldValue,
                                    values,
                                }) => (
                                    <Form onSubmit={handleSubmit}>
                                        <div className="institute-head p-2">
                                            <Row>
                                                <Col md="2">
                                                    <FormGroup>
                                                        <Label for="exampleDatetime">
                                                            Voucher Sr. No. :
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            name="receipt_sr_no"
                                                            id="receipt_sr_no"
                                                            onChange={handleChange}
                                                            value={values.receipt_sr_no}
                                                            // isValid={
                                                            //   touched.receipt_sr_no && !errors.receipt_sr_no
                                                            // }
                                                            // isInvalid={!!errors.receipt_sr_no}
                                                            readOnly={true}
                                                        />
                                                        <span className="text-danger">
                                                            {errors.receipt_sr_no}
                                                        </span>
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup>
                                                        <Label for="exampleDatetime">Voucher No.:</Label>
                                                        <Input
                                                            type="text"
                                                            readOnly={true}
                                                            placeholder="1234"
                                                            value={values.receipt_code}
                                                            className="tnx-pur-inv-text-box mb-0"
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="2">
                                                    <FormGroup>
                                                        <Label for="exampleDatetime">
                                                            Transaction Date :
                                                        </Label>
                                                        <MyDatePicker
                                                            autoComplete="off"
                                                            className="datepic form-control"
                                                            name="pi_transaction_dt"
                                                            placeholderText="dd/MM/yyyy"
                                                            id="pi_transaction_dt"
                                                            dateFormat="dd/MM/yyyy"
                                                            // onChange={handleChange}
                                                            value={values.pi_transaction_dt}
                                                            selected={values.pi_transaction_dt}
                                                            // maxDate={new Date()}
                                                            onChange={(e) => {
                                                                console.log("e.target.value ", e);
                                                                if (e != null && e != "") {
                                                                    console.log(
                                                                        "warn:: isValid",
                                                                        moment(e, "DD-MM-YYYY").isValid()
                                                                    );
                                                                    if (
                                                                        moment(e, "DD-MM-YYYY").isValid() == true
                                                                    ) {
                                                                        setFieldValue("pi_transaction_dt", e);
                                                                        checkInvoiceDateIsBetweenFYFun(
                                                                            e,
                                                                            setFieldValue
                                                                        );
                                                                    }
                                                                } else {
                                                                    setFieldValue("pi_transaction_dt", "");
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-danger">
                                                            {errors.pi_transaction_dt}
                                                        </span>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div
                                            className="tbl-body-style-new"
                                        // style={{ maxHeight: "67vh", height: "67vh" }}
                                        >
                                            <Table size="sm" className="tbl-font mt-2 mb-2">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "10%", textAlign: "center" }}>
                                                            Type
                                                        </th>
                                                        <th style={{ width: "70%", textAlign: "center" }}>
                                                            Particulars
                                                        </th>
                                                        <th style={{ width: "10%", textAlign: "center" }}>
                                                            Credit &nbsp;
                                                        </th>
                                                        <th
                                                            style={{ width: "10%", textAlign: "center" }}
                                                            className="pl-4"
                                                        >
                                                            Debit &nbsp;
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody style={{ borderTop: "2px solid transparent" }}>
                                                    {rows.length > 0 &&
                                                        rows.map((vi, ii) => {
                                                            return (
                                                                <tr className="entryrow">
                                                                    <td
                                                                        style={{
                                                                            width: "10%",
                                                                        }}
                                                                    >
                                                                        <FormGroup>
                                                                            <Select
                                                                                isClearable={true}
                                                                                required
                                                                                onChange={(v) => {
                                                                                    this.handleChangeArrayElement(
                                                                                        "type",
                                                                                        v,
                                                                                        ii
                                                                                    );
                                                                                }}
                                                                                value={this.setElementValue("type", ii)}
                                                                                placeholder="select type"
                                                                                options={typeOpts}
                                                                            ></Select>
                                                                        </FormGroup>
                                                                    </td>

                                                                    <td
                                                                        style={{
                                                                            width: "70%",
                                                                            background: "#f5f5f5",
                                                                        }}
                                                                    >
                                                                        <FormGroup>
                                                                            <Select
                                                                                className="selectTo"
                                                                                components={{
                                                                                    DropdownIndicator: () => null,
                                                                                    IndicatorSeparator: () => null,
                                                                                }}
                                                                                placeholder=""
                                                                                isClearable
                                                                                options={this.getCurrentOpt(ii)}
                                                                                theme={(theme) => ({
                                                                                    ...theme,
                                                                                    height: "26px",
                                                                                    borderRadius: "5px",
                                                                                })}
                                                                                onChange={(v, triggeredAction) => {
                                                                                    console.log({ triggeredAction });
                                                                                    console.log(
                                                                                        "In a Particular On Change.!",
                                                                                        v
                                                                                    );
                                                                                    if (v == null) {
                                                                                        // Clear happened
                                                                                        console.log("clear index=>", ii);
                                                                                        this.handleClearPayment(ii);
                                                                                    } else {
                                                                                        this.handleChangeArrayElement(
                                                                                            "perticulars",
                                                                                            v,
                                                                                            ii
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                value={this.setElementValue(
                                                                                    "perticulars",
                                                                                    ii
                                                                                )}
                                                                            />
                                                                        </FormGroup>
                                                                    </td>

                                                                    <td
                                                                        style={{
                                                                            width: "10%",
                                                                        }}
                                                                    >
                                                                        <FormGroup>
                                                                            <Input
                                                                                type="text"
                                                                                onChange={(e) => {
                                                                                    let v = e.target.value;
                                                                                    this.handleChangeArrayElement(
                                                                                        "debit",
                                                                                        v,
                                                                                        ii
                                                                                    );
                                                                                }}
                                                                                style={{ textAlign: "center" }}
                                                                                value={this.setElementValue(
                                                                                    "debit",
                                                                                    ii
                                                                                )}
                                                                                readOnly={
                                                                                    this.setElementValue("type", ii) &&
                                                                                        this.setElementValue("type", ii)[
                                                                                        "value"
                                                                                        ] == "cr"
                                                                                        ? false
                                                                                        : true
                                                                                }
                                                                            />
                                                                        </FormGroup>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            width: "10%",
                                                                        }}
                                                                    >
                                                                        <FormGroup>
                                                                            <Input
                                                                                type="text"
                                                                                onChange={(e) => {
                                                                                    let v = e.target.value;
                                                                                    this.handleChangeArrayElement(
                                                                                        "credit",
                                                                                        v,
                                                                                        ii
                                                                                    );
                                                                                }}
                                                                                style={{ textAlign: "center" }}
                                                                                value={this.setElementValue(
                                                                                    "credit",
                                                                                    ii
                                                                                )}
                                                                                readOnly={
                                                                                    this.setElementValue("type", ii) &&
                                                                                        this.setElementValue("type", ii)[
                                                                                        "value"
                                                                                        ] == "dr"
                                                                                        ? false
                                                                                        : true
                                                                                }
                                                                            />
                                                                        </FormGroup>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    <tr className="entryrow">
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Select
                                                                    placeholder="select type"
                                                                // options={typeOpts}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td
                                                            style={{
                                                                width: "70%",
                                                                background: "#f5f5f5",
                                                            }}
                                                        >
                                                            {/* <Select
                            placeholder=""
                            styles={customStyles1}
                            isClearable
                          /> */}
                                                        </td>

                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                    <tr className="entryrow">
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Select
                                                                    placeholder="select type"
                                                                // options={typeOpts}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td
                                                            style={{
                                                                width: "70%",
                                                                background: "#f5f5f5",
                                                            }}
                                                        >
                                                            {/* <Select
                            placeholder=""
                            styles={customStyles1}
                            isClearable
                          /> */}
                                                        </td>

                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                    <tr className="entryrow">
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Select
                                                                    placeholder="select type"
                                                                // options={typeOpts}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td
                                                            style={{
                                                                width: "70%",
                                                                background: "#f5f5f5",
                                                            }}
                                                        >
                                                            {/* <Select
                            placeholder=""
                            styles={customStyles1}
                            isClearable
                          /> */}
                                                        </td>

                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                    <tr className="entryrow">
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Select
                                                                    placeholder="select type"
                                                                // options={typeOpts}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td
                                                            style={{
                                                                width: "70%",
                                                                background: "#f5f5f5",
                                                            }}
                                                        >
                                                            {/* <Select
                            placeholder=""
                            styles={customStyles1}
                            isClearable
                          /> */}
                                                        </td>

                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                    <tr className="entryrow">
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Select
                                                                    placeholder="select type"
                                                                // options={typeOpts}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td
                                                            style={{
                                                                width: "70%",
                                                                background: "#f5f5f5",
                                                            }}
                                                        >
                                                            {/* <Select
                            placeholder=""
                            styles={customStyles1}
                            isClearable
                          /> */}
                                                        </td>

                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td style={{ width: "10%" }}>
                                                            <FormGroup>
                                                                <Input
                                                                    type="text"
                                                                    style={{ textAlign: "center" }}
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                                <thead>
                                                    <tr style={{ background: "#DDE2ED" }}>
                                                        <td
                                                            className="pr-2 qtotalqty"
                                                            style={{ width: "10%" }}
                                                        >
                                                            {" "}
                                                            Total
                                                        </td>
                                                        <td style={{ width: "70%" }}></td>
                                                        <td
                                                            style={{
                                                                width: "10 %",
                                                            }}
                                                        >
                                                            <FormGroup>
                                                                <Input
                                                                    style={{
                                                                        textAlign: "center",
                                                                        // width: "8%",
                                                                        background: "transparent",
                                                                        border: "none",
                                                                    }}
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={this.getTotalDebitAmt()}
                                                                    readonly
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        <td style={{ width: "10%" }}>
                                                            {" "}
                                                            <FormGroup>
                                                                <Input
                                                                    style={{
                                                                        textAlign: "center",
                                                                        //width: '8%',
                                                                        background: "transparent",
                                                                        border: "none",
                                                                    }}
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={this.getTotalCreditAmt()}
                                                                    readonly
                                                                />
                                                            </FormGroup>
                                                        </td>
                                                        {/* <td></td> */}
                                                    </tr>
                                                </thead>
                                            </Table>
                                        </div>
                                        <Row className="mb-2">
                                            <Col sm={9}>
                                                <Row className="mt-2">
                                                    <Col sm={1}>
                                                        <Label className="text-label">Narration:</Label>
                                                    </Col>
                                                    <Col sm={10}>
                                                        <FormGroup>
                                                            <Input
                                                                type="textarea"
                                                                placeholder="Enter Narration"
                                                                style={{ height: "72px", resize: "none" }}
                                                                className="text-box"
                                                                id="narration"
                                                                onChange={handleChange}
                                                                // rows={5}
                                                                // cols={25}
                                                                name="narration"
                                                                value={values.narration}
                                                            />
                                                        </FormGroup>
                                                        {/* <Form.Control
                              as="textarea"
                              resize="none"
                              placeholder="Enter Narration"
                              style={{ height: "72px" }}
                              className="text-box"
                              id="narration"
                              onChange={handleChange}
                              name="narration"
                              value={values.narration}
                            /> */}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <Row className="py-1">
                                            <Col className="text-end">
                                                <Button type="submit" className="successbtn-style me-2">
                                                    Submit
                                                </Button>

                                                <Button
                                                    className="cancel-btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        this.props.history.push("/receipt");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                )}
                            />
                        </div>

                        {/* {empSalaryData && empSalaryData.length > 0 ? (
              <Row>
                <Col md="12">
                  <div className="attendance-tbl">
                    <Table bordered size="sm" className="main-tbl-style">
                      <thead
                        style={{
                          backgroundColor: "#F6F5F7",
                        }}
                        className="datastyle-head"
                      >
                        <tr>
                          <th className="th-style" style={{ zIndex: 99 }}></th> 
                          <th>Employee Name</th>
                          <th>Hour Wise Salary</th>
                          <th>Piece Wise Salary</th>
                          <th>Day Wise Salary</th>
                          <th>Point Wise Salary</th>
                        </tr>
                      </thead>
                      <tbody
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {empSalaryData.map((v, i) => {
                          return (
                            <>
                              <tr>
                                <td>{v.employeeName}</td>
                                <td>{parseFloat(v.hourSalary).toFixed(2)}</td>
                                <td>{parseFloat(v.pieceSalary).toFixed(2)}</td>
                                <td>{parseFloat(v.daySalary).toFixed(2)}</td>
                                <td>{parseFloat(v.pointSalary).toFixed(2)}</td>
                              </tr>
                            </>
                          );
                        })}
                        <tr>
                          <td style={{ fontWeight: "bold" }}>TOTAL</td>
                          <td style={{ fontWeight: "bold" }}>
                            {parseFloat(sumData.hourSum).toFixed(2)}
                          </td>
                          <td style={{ fontWeight: "bold" }}>
                            {parseFloat(sumData.pieceSum).toFixed(2)}
                          </td>
                          <td style={{ fontWeight: "bold" }}>
                            {parseFloat(sumData.daySum).toFixed(2)}
                          </td>
                          <td style={{ fontWeight: "bold" }}>
                            {parseFloat(sumData.pointSum).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            ) : (
              <Row>
                <Col md="12">
                  <div className="attendance-tbl">
                    <Table bordered size="sm" className="main-tbl-style">
                      <tr>
                        <td>No Data Exists</td>
                      </tr>
                    </Table>
                  </div>
                </Col>
              </Row>
            )} */}
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default WithUserPermission(CreateReceipt);
