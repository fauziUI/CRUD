import React from "react";
import Axios from "axios";
import { API_URL } from "../constants/API";
import "../assets/styles/admin.css";
import { connect } from "react-redux";

class Admin extends React.Component {
  state = {
    productList: [],

    filteredProductList: [],
    page: 1,
    maxPage: 0,
    itemPerPage: 3,
    searchProductName: "",
    sortBy: "",

    addProductName: "",
    addPrice: "",
    addProductImage: "",
    addmodal: "",
    addstock: "",

    editId: 0,

    editProductName: "",
    editPrice: 0,
    editProductImage: "",
    editmodal: "",
    editstock: "",
  };

  editToggle = (val) => {
    this.setState({
      editId: val.id,
      editProductName: val.productName,
      editPrice: val.price,
      editProductImage: val.productImage,
      editmodal: val.modal,
      editstock: val.stock,
    });
  };

  fetchProduct = () => {
    Axios.get(`${API_URL}/product`).then((result) => {
      this.setState({
        productList: result.data,
        maxPage: Math.ceil(result.data.length / this.state.itemPerPage),
        filteredProductList: result.data,
      });
    });
  };

  deleteBtnHandler = (deleteId) => {
    if (window.confirm("yakin akan menghapus product?")) {
      Axios.delete(`${API_URL}/product/${deleteId}`).then(() => {
        this.fetchProduct();
      });
    } else {
      alert("cancel delete barang");
    }
  };

  cancelEdit = () => {
    this.setState({ editId: 0 });
  };

  saveBTnHandler = () => {
    Axios.patch(`${API_URL}/product/${this.state.editId}`, {
      productName: this.state.editProductName,
      price: parseInt(this.state.editPrice),
      productImage: this.state.editProductImage,
      modal: this.state.editmodal,
      stock: this.state.editstock,
    }).then(() => {
      this.fetchProduct();
      this.cancelEdit();
    });
  };

  renderProduct = () => {
    const indexAwal = (this.state.page - 1) * this.state.itemPerPage;
    let rawData = [...this.state.filteredProductList];

    const compareString = (a, b) => {
      if (a.productName < b.productName) {
        return -1;
      }
      if (a.productName > b.productName) {
        return 1;
      }
      return 0;
    };

    switch (this.state.sortBy) {
      case "lowPrice":
        rawData.sort((a, b) => a.price - b.price);
        break;
      case "highPrice":
        rawData.sort((a, b) => b.price - a.price);
        break;
      case "az":
        rawData.sort(compareString);
        break;
      case "za":
        rawData.sort((a, b) => compareString(b, a));
        break;
      default:
        rawData = [...this.state.filteredProductList];
        break;
    }

    const dataTampil = rawData.slice(
      indexAwal,
      indexAwal + this.state.itemPerPage
    );

    return dataTampil.map((val) => {
      if (val.id === this.state.editId) {
        return (
          <tr>
            <td>{val.id}</td>
            <td>
              <input
                value={this.state.editProductName}
                onChange={this.inputHandler}
                name="editProductName"
                type="text"
                className="form-control"
              />
            </td>
            <td>
              <input
                value={this.state.editstock}
                onChange={this.inputHandler}
                name="editstock"
                type="number"
                className="form-control"
              />
            </td>
            <td>
              <input
                value={this.state.editProductImage}
                onChange={this.inputHandler}
                name="editProductImage"
                type="text"
                className="form-control"
              />
            </td>
            <td>
              <input
                value={this.state.editmodal}
                onChange={this.inputHandler}
                name="editmodal"
                type="number"
                className="form-control"
              />
            </td>
            <td>
              <input
                value={this.state.editPrice}
                onChange={this.inputHandler}
                name="editPrice"
                type="number"
                className="form-control"
              />
            </td>
            <td>
              <button onClick={this.saveBTnHandler} className="btn btn-success">
                Save
              </button>
            </td>
            <td>
              <button onClick={this.cancelEdit} className="btn btn-danger">
                Cancel
              </button>
            </td>
          </tr>
        );
      }

      return (
        <tr>
          <td>{val.id}</td>
          <td>{val.productName}</td>
          <td>{val.stock}</td>
          <td>
            <img
              className="admin-product-image"
              src={val.productImage}
              alt=""
            />
          </td>
          <td>{val.modal}</td>
          <td>{val.price}</td>
          <td>
            <button
              onClick={() => this.editToggle(val)}
              className="btn btn-secondary"
            >
              Edit
            </button>
          </td>
          <td>
            <button
              onClick={() => this.deleteBtnHandler(val.id)}
              className="btn btn-danger"
            >
              Delete
            </button>
          </td>
        </tr>
      );
    });
  };

  addNewProduct = () => {
    Axios.get(`${API_URL}/product`,{
      params: {
          productName: this.state.addProductName
      }
    })
    .then((result)=>{
      if (result.data.length){
        alert("Nama Barang Sudah Ada, Silahkan Tambah Dengan Nama Barang Lain")
      } else {
        Axios.post(`${API_URL}/product`, {
          productName: this.state.addProductName,
          price: parseInt(this.state.addPrice),
          productImage: this.state.addProductImage,
          modal: this.state.addmodal,
          stock: this.state.addstock,
        }).then(() => {
          this.fetchProduct();
          this.setState({
            addProductName: "",
            addPrice: "",
            addProductImage: "",
            addmodal: "",
            addstock: "",
          })
        })
      }
    })
  }

  nextPageHandler = () => {
    if (this.state.page < this.state.maxPage) {
      this.setState({ page: this.state.page + 1 });
    }
  };

  prevPageHandler = () => {
    if (this.state.page > 1) {
      this.setState({ page: this.state.page - 1 });
    }
  };

  searchBtnHandler = () => {
    const filteredProductList = this.state.productList.filter((val) => {
      return (
        val.productName
          .toLowerCase()
          .includes(this.state.searchProductName.toLowerCase())
      );
    });

    this.setState({
      filteredProductList,
      maxPage: Math.ceil(filteredProductList.length / this.state.itemPerPage),
      page: 1,
    });
  };

  inputHandler = (event) => {
    // const name = event.target.name
    // const value = event.target.value
    const { name, value } = event.target;

    this.setState({ [name]: value });
  };

  searchInputHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    this.setState({ [name]: value });
  };

  componentDidMount() {
    this.fetchProduct();
  }

  render() {
    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-3">
            <div className="card">
              <div className="card-header">
                <strong>Filter Product</strong>
              </div>
              <div className="card-body">
                <label htmlFor="searchProductName">Product Name</label>
                <input
                  onChange={this.searchInputHandler}
                  name="searchProductName"
                  type="text"
                  className="form-control mb-3"
                />
                <button
                  onClick={this.searchBtnHandler}
                  className="btn btn-primary"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="card mt-4">
              <div className="card-header">
                <strong>Sort Product</strong>
              </div>
              <div className="card-body">
                <label htmlFor="sortBy">Sort By</label>
                <select
                  onChange={this.searchInputHandler}
                  name="sortBy"
                  className="form-control"
                >
                  <option value="">Default</option>
                  <option value="lowPrice">Lowest Price</option>
                  <option value="highPrice">Highest Price</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <div className="d-flex flex-row justify-content-between align-items-center">
                <button
                  disabled={this.state.page === 1}
                  onClick={this.prevPageHandler}
                  className="btn btn-dark"
                >
                  {"<"}
                </button>
                <div className="text-center">
                  Page {this.state.page} of {this.state.maxPage}
                </div>
                <button
                  disabled={this.state.page === this.state.maxPage}
                  onClick={this.nextPageHandler}
                  className="btn btn-dark"
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>
          <div className="col-9">
            <div className="d-flex flex-wrap flex-row">
              <h1> Manage Product </h1>
              <table className="table mt-4">
                <thead className="thead-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Image</th>
                    <th>Harga Beli</th>
                    <th>Harga Jual</th>
                    <th colSpan="2">Action</th>
                  </tr>
                </thead>

                <tbody>{this.renderProduct()}</tbody>

                <tfoot className="bg-light">
                  <tr>
                    <td></td>
                    <td>
                      <input
                        value={this.state.addProductName}
                        onChange={this.inputHandler}
                        name="addProductName"
                        type="text"
                        placeholder="Nama"
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        value={this.state.addstock}
                        onChange={this.inputHandler}
                        name="addstock"
                        placeholder="stock"
                        type="number"
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        value={this.state.addProductImage}
                        onChange={this.inputHandler}
                        name="addProductImage"
                        placeholder="URL Foto Barang"
                        type="text"
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        value={this.state.addmodal}
                        onChange={this.inputHandler}
                        name="addmodal"
                        type="number"
                        placeholder="modal"
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        value={this.state.addPrice}
                        onChange={this.inputHandler}
                        name="addPrice"
                        type="number"
                        placeholder="jual"
                        className="form-control"
                      />
                    </td>
                    <td colSpan="2">
                      <button
                        onClick={this.addNewProduct}
                        className="btn btn-info">
                        Add Product
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userGlobal: state.user,
  };
};

export default connect(mapStateToProps)(Admin);
