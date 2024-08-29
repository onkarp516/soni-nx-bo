import React, { useState, useRef } from "react";
import GridTable from "@nadavshaar/react-grid-table";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
// import Button from "@material-ui/core/Button";
import {
  ModalHeader,
  Modal,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Row,
  Col,
  Spinner,
  Dropdown,
  Button,
} from "reactstrap";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import {
  isWriteAuthorized,
  isReadAuthorized,
  getHeader,
  CustomDTHeader,
  WithUserPermission,
  isActionExist,
} from "@/helpers";
import { DTCompanyUrl } from "@/services/api";
import {
  createCompany,
  findCompany,
  updateCompany,
  deleteCompany,
} from "@/services/api_function";

import axios from "axios";

const ActionsCellRender = ({
  tableManager,
  value,
  field,
  data,
  column,
  colIndex,
  rowIndex,
}) => {
  const { additionalProps } = tableManager.config;
  const { header, accessPermissionProps } = additionalProps;
  const { currentIndex, onEditModalShow, onDeleteModalShow } = header;
  return (
    <>
      {currentIndex === rowIndex ? (
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      ) : (
        <>
          {/* {JSON.stringify(accessPermissionProps.userPermissions)} */}
          {isActionExist(
            "company",
            "edit",
            accessPermissionProps.userPermissions
          ) && (
            <Button
              title="EDIT"
              id="Tooltipedit"
              className="edityellowbtn"
              onClick={(e) => {
                e.preventDefault();
                onEditModalShow(true, data.id, rowIndex);
              }}
            >
              <i className="fa fa-edit"></i>
            </Button>
          )}
        </>
      )}
      {isActionExist(
        "company",
        "delete",
        accessPermissionProps.userPermissions
      ) && (
        <Button
          title="DELETE"
          id="Tooltipdelete"
          className="deleteredbtn"
          onClick={(e) => {
            e.preventDefault();
            onDeleteModalShow(data.id);
          }}
        >
          <i className="fa fa-trash"></i>
        </Button>
      )}
    </>
  );
};

function Company(props) {
  const [addModalShow, setAddModalShow] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [designationObject, setDesignationObject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rowData, setRowData] = useState([]);

  const [currentIndex, setcurrentIndex] = useState(0);
  const tableManager = React.useRef(null);
  const setTableManager = (tm) => (tableManager.current = tm);

  const getColumns = () => {
    return [
      {
        id: "company_name",
        field: "companyName",
        label: "Company Name",
        resizable: true,
      },
      {
        id: "description",
        field: "description",
        label: "Description",
        resizable: true,
      },
      {
        id: "created_at",
        label: "Created Date",
        cellRenderer: ({ data }) => {
          return (
            <div className="nightshift">
              {moment(data.createdAt).format("Do MMM YYYY")}
            </div>
          );
        },

        resizable: true,
      },
      {
        id: "buttons",
        label: "Action",
        pinned: true,
        width: "100px",
        sortable: false,
        resizable: false,
        cellRenderer: ActionsCellRender,
      },
    ];
  };

  const onRowsRequest = async (requestData, tableManager) => {
    let req = {
      from: requestData.from,
      to: requestData.to,
      searchText: requestData.searchText,
      sort: JSON.stringify(requestData.sort),
    };
    const response = await axios({
      url: DTCompanyUrl(),
      method: "POST",
      headers: getHeader(),
      data: JSON.stringify(req),
    })
      .then((response) => response.data)
      .catch((e) => {
        console.log("e--->", e);
      });

    if (!response?.rows) return;

    return {
      rows: response.rows,
      totalRows: response.totalRows,
    };
  };

  const addBtn = isWriteAuthorized("master", "companyPermission") &&
    isActionExist("company", "create", props.userPermissions) && (
      <>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddModalShow(true);
          }}
        >
          <i className="fa fa-plus"></i>
        </button>
      </>
    );
  const onAddModalShow = (status) => {
    setAddModalShow(status);
  };

  const onEditModalShow = (status, id, rowIndex) => {
    if (status) {
      setcurrentIndex(rowIndex);
      let reqData = {
        id: id,
      };
      findCompany(reqData)
        .then((response) => {
          if (response.data.responseStatus == 200) {
            setDesignationObject(response.data.response);
            setcurrentIndex(0);
            setEditModalShow(status);
          } else {
            toast.error("✘ " + response.data.message);
          }
        })
        .catch((error) => {
          console.log("errors", error);
        });
    } else {
      setcurrentIndex(0);
      setEditModalShow(status);
    }
  };

  const onDeleteModalShow = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      // icon: "warning",
      customClass: "sweetclass",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (!result.isConfirmed) {
        return false;
      }

      let reqData = {
        id: id,
      };
      deleteCompany(reqData)
        .then((response) => {
          if (response.data.responseStatus == 200) {
            toast.success("✔ " + response.data.message);
            tableManager.current.asyncApi.resetRows();
          } else {
            toast.error("✘ " + response.data.message);
          }
        })
        .catch((error) => {
          toast.error("✘ " + error);
        });
    });
  };

  return (
    <div className="pt-2 pl-2" style={{ background: "#fff" }}>
      {/* <h4>Company</h4> */}
      {(isReadAuthorized("master", "companyPermission") ||
        isWriteAuthorized("master", "companyPermission")) && (
        <GridTable
          components={{ Header: CustomDTHeader }}
          columns={getColumns()}
          onRowsRequest={onRowsRequest}
          onRowClick={(
            { rowIndex, data, column, isEdit, event },
            tableManager
          ) => !isEdit}
          minSearchChars={0}
          isLoading={isLoading}
          additionalProps={{
            header: {
              label: "Company",
              addBtn: addBtn,
              currentIndex: currentIndex,
              onEditModalShow: onEditModalShow,
              onDeleteModalShow: onDeleteModalShow,
            },
            accessPermissionProps: props,
          }}
          onLoad={setTableManager}
        />
      )}
      {/* Add Modal */}
      {/* test */}
      <Modal
        className="modal-lg p-2"
        isOpen={addModalShow}
        toggle={() => {
          onAddModalShow(false);
        }}
        autoFocus={false}
      >
        <ModalHeader
          className="p-2 modalheadernew"
          toggle={() => {
            onAddModalShow(false);
          }}
        >
          Create Company
        </ModalHeader>
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          initialValues={{
            companyName: "",
            description: "",
          }}
          validationSchema={Yup.object().shape({
            companyName: Yup.string()
              .trim()
              .nullable()
              .required("Company name is required"),
            description: Yup.string()
              .trim()
              .nullable()
              .required("Description is required"),
          })}
          onSubmit={(values, { resetForm, setStatus, setSubmitting }) => {
            setStatus();
            setIsLoading(true);
            // let requestData = new FormData();
            // requestData.append("companyName", values.companyName);
            // requestData.append("description", values.description);
            let requestData = {
              companyName: values.companyName,
              description: values.description,
            };
            createCompany(requestData)
              .then((response) => {
                setIsLoading(false);
                if (response.data.responseStatus === 200) {
                  setSubmitting(false);
                  toast.success("✔ " + response.data.message);
                  resetForm();
                  onAddModalShow(false);
                  tableManager.current.asyncApi.resetRows();
                } else {
                  setSubmitting(false);
                  toast.error("✘ " + response.data.message);
                }
              })
              .catch((error) => {
                setIsLoading(false);
                setSubmitting(false);
                toast.error("✘ " + error);
              });
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
            <Form autoComplete="off">
              <ModalBody>
                <Row>
                  <Col md="4">
                    <FormGroup>
                      <Label>Company Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter Company name"
                        name="companyName"
                        onChange={handleChange}
                        value={values.companyName}
                        invalid={errors.companyName ? true : false}
                        autoFocus={true}
                      />
                      <FormFeedback>{errors.companyName}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Label>Description </Label>
                      <Input
                        type="text"
                        placeholder="Enter Description "
                        name="description"
                        onChange={handleChange}
                        value={values.description}
                        invalid={errors.description ? true : false}
                      />
                      <FormFeedback>{errors.description}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter className="p-2">
                {isLoading ? (
                  <Button
                    className="mainbtn1 text-white"
                    type="button"
                    disabled={isSubmitting}
                  >
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    Creating...
                  </Button>
                ) : (
                  <Button type="submit" className="mainbtn1 text-white">
                    Create
                  </Button>
                )}

                <Button
                  className="modalcancelbtn"
                  type="button"
                  onClick={() => {
                    onAddModalShow(null);
                  }}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          )}
        />
      </Modal>
      {/* Edit Modal */}
      <Modal
        className="modal-lg p-2"
        isOpen={editModalShow}
        toggle={() => {
          onEditModalShow(null);
        }}
      >
        <ModalHeader
          className="modalheadernew p-2"
          toggle={() => {
            onEditModalShow(null);
          }}
        >
          Update Company
        </ModalHeader>
        <Formik
          validateOnBlur={false}
          validateOnChange={false}
          enableReinitialize={true}
          initialValues={{
            companyName:
              designationObject != null ? designationObject.companyName : "",
            description:
              designationObject != null ? designationObject.description : "",
          }}
          validationSchema={Yup.object().shape({
            companyName: Yup.string()
              .trim()
              .nullable()
              .required("Company name is required"),
            description: Yup.string()
              .trim()
              .nullable()
              .required("Description is required"),
          })}
          onSubmit={(values, { resetForm, setStatus, setSubmitting }) => {
            setStatus();
            setIsLoading(true);
            let requestData = {
              id: designationObject.id,
              companyName: values.companyName,
              description: values.description,
            };

            updateCompany(requestData)
              .then((response) => {
                setIsLoading(false);
                if (response.data.responseStatus === 200) {
                  setSubmitting(false);
                  toast.success("✔ " + response.data.message);
                  resetForm();
                  onEditModalShow(false);
                  tableManager.current.asyncApi.resetRows();
                } else {
                  setSubmitting(false);
                  toast.error("✘ " + response.data.message);
                }
              })
              .catch((error) => {
                setIsLoading(false);
                setSubmitting(false);
                toast.error("✘ " + error);
              });
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
            <Form autoComplete="off">
              <ModalBody>
                <Row>
                  <Col md="4">
                    <FormGroup>
                      <Label>Company Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter Company name"
                        name="companyName"
                        onChange={handleChange}
                        value={values.companyName}
                        invalid={errors.companyName ? true : false}
                      />
                      <FormFeedback>{errors.companyName}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Label>Description</Label>
                      <Input
                        type="text"
                        placeholder="Enter Description"
                        name="description"
                        onChange={handleChange}
                        value={values.description}
                        invalid={errors.description ? true : false}
                      />
                      <FormFeedback>{errors.description}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
              </ModalBody>
              <ModalFooter className="p-2">
                {isLoading ? (
                  <Button
                    className="mainbtn1 text-white"
                    type="button"
                    disabled={isSubmitting}
                  >
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    updating...
                  </Button>
                ) : (
                  <Button type="submit" className="mainbtn1 text-white">
                    Update
                  </Button>
                )}
                <Button
                  className="mainbtn1 modalcancelbtn"
                  type="button"
                  onClick={() => {
                    onEditModalShow(null);
                  }}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          )}
        />
      </Modal>
    </div>
  );
}

export default WithUserPermission(Company);