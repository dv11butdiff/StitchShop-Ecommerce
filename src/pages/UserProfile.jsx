import React, { useState, useEffect, Fragment } from "react";
import { Container, Row, Col } from "react-bootstrap";
import useData from "../utils/dataUtil";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const [user, setUser] = useState({});

  const { data, loading, error, getData } = useData("auth/me/");
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (data) {
      const primaryAddress =
        data.address && data.address.length > 0 ? data.address[0] : null;

      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        middleName: data.middle_name,
        lastName: data.last_name,
        phoneNumber: data.phone,
        role: data.role,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        profilePicture: "https://placehold.co/150x150/0f3460/FFFFFF?text=JD",
        bio: "Passionate shopper and tech enthusiast. Always looking for the best deals!",
        address: primaryAddress
          ? {
              addressId: primaryAddress.address_id,
              streetName: primaryAddress.street_name,
              buildingHouseNo: primaryAddress.building_house_no,
              barangay: primaryAddress.barangay,
              cityMunicipality: primaryAddress.city_municipality,
              province: primaryAddress.province,
              postalCode: primaryAddress.postal_code,
              country: primaryAddress.country,
              addressType: primaryAddress.address_type,
            }
          : null,
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(
        error?.data?.detail || "Failed to load user profile. Please try again."
      );
    }
  }, [error]);

  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState({});

  useEffect(() => {
    if (user.id) {
      setEditableUser(user);
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressFieldName = name.split(".")[1];
      setEditableUser((prev) => ({
        ...prev,
        address: {
          ...(prev.address || {}),
          [addressFieldName]: value,
        },
      }));
    } else {
      setEditableUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", editableUser);

    setUser(editableUser);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableUser(user);
  };

  const formatAddress = (addressObject) => {
    if (!addressObject) return "No address provided.";

    const parts = [];
    if (addressObject.buildingHouseNo)
      parts.push(addressObject.buildingHouseNo);
    if (addressObject.streetName) parts.push(addressObject.streetName);
    if (addressObject.barangay) parts.push(addressObject.barangay);
    if (addressObject.cityMunicipality)
      parts.push(addressObject.cityMunicipality);
    if (addressObject.province) parts.push(addressObject.province);
    if (addressObject.postalCode) parts.push(addressObject.postalCode);
    if (addressObject.country) parts.push(addressObject.country);
    return parts.filter(Boolean).join(", ");
  };

  const handleLogout = async () => {
    const BASE_URL = "http://localhost:8000/api";
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/logout/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Successfully logged out!");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (logoutError) {
      console.error(
        "Logout Error:",
        logoutError.response?.data?.detail || logoutError.message
      );
      toast.error(
        logoutError.response?.data?.detail || "An error occurred during logout."
      );
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mr-3"></div>
        Loading user profile...
      </div>
    );
  }

  if (error || !user.id) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-600">
        <p>Failed to load user profile. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <Fragment>
      <section className="py-8 font-sans bg-gray-50 min-h-screen">
        <Container>
          <Row className="justify-content-center">
            <Col lg={9} md={10} sm={12}>
              <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 md:p-12 w-full border border-gray-100">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight">
                  User Profile
                </h1>

                <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
                  <div className="flex-shrink-0">
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName}'s Profile`}
                      className="w-36 h-36 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-blue-500 shadow-lg ring-4 ring-blue-200 ring-opacity-50 transition-all duration-300 hover:scale-105" // Larger, more prominent image with subtle animation
                    />
                  </div>

                  <div className="flex-grow w-full">
                    {isEditing ? (
                      <div className="space-y-5">
                        {" "}
                        <InputField
                          label="First Name"
                          name="firstName"
                          value={editableUser.firstName || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Middle Name"
                          name="middleName"
                          value={editableUser.middleName || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Last Name"
                          name="lastName"
                          value={editableUser.lastName || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Email"
                          name="email"
                          value={editableUser.email || ""}
                          onChange={handleChange}
                          type="email"
                        />
                        <InputField
                          label="Phone Number"
                          name="phoneNumber"
                          value={editableUser.phoneNumber || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Building/House No."
                          name="address.buildingHouseNo"
                          value={editableUser.address?.buildingHouseNo || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Street Name"
                          name="address.streetName"
                          value={editableUser.address?.streetName || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Barangay"
                          name="address.barangay"
                          value={editableUser.address?.barangay || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="City/Municipality"
                          name="address.cityMunicipality"
                          value={editableUser.address?.cityMunicipality || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Province"
                          name="address.province"
                          value={editableUser.address?.province || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Postal Code"
                          name="address.postalCode"
                          value={editableUser.address?.postalCode || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Country"
                          name="address.country"
                          value={editableUser.address?.country || ""}
                          onChange={handleChange}
                        />
                        <TextareaField
                          label="Bio"
                          name="bio"
                          value={editableUser.bio || ""}
                          onChange={handleChange}
                        />
                        <div className="flex justify-end space-x-4 mt-8">
                          {" "}
                          <button
                            onClick={handleCancelEdit}
                            className="px-6 py-3 rounded-xl bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition duration-300 ease-in-out shadow-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveChanges}
                            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-gray-700">
                        {" "}
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {" "}
                          {user.firstName}{" "}
                          {user.middleName && `${user.middleName} `}{" "}
                          {user.lastName}
                        </h2>
                        <p className="text-lg">
                          <strong className="font-semibold text-gray-800">
                            Username:
                          </strong>{" "}
                          {user.username}
                        </p>
                        <p className="text-lg">
                          <strong className="font-semibold text-gray-800">
                            Email:
                          </strong>{" "}
                          {user.email}
                        </p>
                        <p className="text-lg">
                          <strong className="font-semibold text-gray-800">
                            Phone:
                          </strong>{" "}
                          {user.phoneNumber}
                        </p>
                        <p className="text-lg">
                          <strong className="font-semibold text-gray-800">
                            Address:
                          </strong>{" "}
                          {user.address
                            ? `${formatAddress(user.address)} (${
                                user.address.addressType
                              })`
                            : "No address provided."}
                        </p>
                        <p className="text-lg leading-relaxed">
                          {" "}
                          <strong className="font-semibold text-gray-800">
                            Bio:
                          </strong>{" "}
                          {user.bio}
                        </p>
                        <div className="mt-8 flex justify-between items-center">
                          {" "}
                          <button
                            onClick={handleEditToggle}
                            className="px-8 py-3 rounded-xl bg-blue-500 text-black font-semibold hover:bg-blue-600 transition duration-300 ease-in-out shadow-lg"
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={handleLogout}
                            className="px-8 py-3 rounded-xl bg-red-500 text-black font-semibold hover:bg-red-600 transition duration-300 ease-in-out shadow-lg"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Fragment>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-base font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base" // Larger padding, rounded corners, subtle shadow
    />
  </div>
);

const TextareaField = ({ label, name, value, onChange }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-base font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows="4"
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base"
    ></textarea>
  </div>
);

export default UserProfile;
