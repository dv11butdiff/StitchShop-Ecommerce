import React, {
  useState,
  useEffect,
  Fragment,
  useContext,
  useCallback,
} from "react";
import { Container, Row, Col } from "react-bootstrap";
import useData from "../utils/dataUtil"; // Reverted to original path
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DataContainer } from "../App"; // Reverted to original path

const UserProfile = () => {
  const { UserInfo, setUserInfo } = useContext(DataContainer); // Get setUserInfo from context
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Use useData hook specifically for fetching the current user's complete profile from /api/auth/me/
  const {
    data: meData,
    error: meError,
    loading: meLoading,
    getData: fetchMeData, // Renamed to clearly indicate fetching "me" data
  } = useData("auth/me/"); // Endpoint for fetching current user's details

  // Use useData hook for updating AppUser data (individual fields)
  const {
    error: userUpdateError,
    loading: userUpdating,
    updateData: updateAppUser,
  } = useData("appusers/"); // Endpoint for updating AppUser

  // Use useData hook for managing Address data (creating/updating individual addresses)
  const {
    createData: createAddress,
    updateData: updateAddress,
    error: addressError,
    loading: addressLoading,
  } = useData("addresses/"); // Endpoint for Address

  // Effect to trigger fetching of current user's data when UserInfo.id becomes available
  useEffect(() => {
    // Only fetch if UserInfo.id exists and we haven't already loaded the profile
    // This prevents unnecessary fetches if the profile is already in state
    if (UserInfo.id && !meLoading && !meError && !user.id) {
      fetchMeData();
    }
  }, [UserInfo.id, meLoading, meError, user.id, fetchMeData]);

  // Effect to update local user state and context when meData (from /auth/me/) changes
  useEffect(() => {
    if (meData) {
      setUserInfo(meData); // Update global context with the latest full user data
      setUser(meData);
      setEditableUser(meData);
      setLoadingProfile(false);
    }
  }, [meData, setUserInfo]);

  // Handle API errors for fetching profile and updates
  useEffect(() => {
    if (meError) {
      toast.error(meError.data?.detail || "Failed to fetch user profile.");
      setLoadingProfile(false);
    }
    if (userUpdateError) {
      toast.error(userUpdateError.data?.detail || "Failed to update profile.");
    }
    if (addressError) {
      toast.error(addressError.data?.detail || "Failed to update address.");
    }
  }, [meError, userUpdateError, addressError]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Check if the input name is for an address field
    if (name.startsWith("address.")) {
      const addressFieldName = name.split(".")[1];
      setEditableUser((prev) => {
        // Ensure address is an array, and operate on the first address object for simplicity.
        // If there's no address yet, initialize it as an array with one empty object.
        const currentAddresses =
          prev.address && prev.address.length > 0 ? [...prev.address] : [{}];
        currentAddresses[0] = {
          ...currentAddresses[0],
          [addressFieldName]: value,
        };
        return {
          ...prev,
          address: currentAddresses,
        };
      });
    } else {
      setEditableUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleSaveChanges = async () => {
    toast.dismiss(); // Clear any existing toasts
    console.log("Editable: ", editableUser);

    // Prepare data for AppUser update (excluding address, as it's handled separately)
    const appUserDataToUpdate = {
      user_id: editableUser.id,
      first_name: editableUser.first_name,
      middle_name: editableUser.middle_name,
      last_name: editableUser.last_name,
      phone: editableUser.phone,
      // Note: username, email, role, created_at, updated_at are typically read-only or managed by backend for AppUser
    };

    // Prepare address data (the first address in the array, if it exists)
    const addressDataToUpdate =
      editableUser.address && editableUser.address.length > 0
        ? editableUser.address[0]
        : null;

    try {
      // First, update the AppUser's basic details using the 'user' ID from UserInfo
      const userUpdateResponse = await updateAppUser(
        UserInfo.id,
        appUserDataToUpdate
      );

      if (userUpdateResponse?.status === 400) {
        toast.error(
          userUpdateResponse.data?.detail || "Failed to update profile details."
        );
      }

      toast.success("Profile updated successfully!");

      // Then, handle address update/creation
      if (addressDataToUpdate) {
        // If an address_id exists, update the existing address
        if (addressDataToUpdate.address_id) {
          const addressUpdateResponse = await updateAddress(
            addressDataToUpdate.address_id,
            addressDataToUpdate
          );
          if (addressUpdateResponse?.status === 200) {
            toast.success("Address updated successfully!");
          } else if (addressUpdateResponse) {
            toast.error(
              addressUpdateResponse.data?.detail || "Failed to update address."
            );
          }
        } else {
          // If no address_id, create a new address for the current user
          // Ensure the user ID is attached to the address data for creation
          const addressCreateResponse = await createAddress({
            ...addressDataToUpdate,
            user: UserInfo.id,
          });
          if (addressCreateResponse?.status === 201) {
            // 201 Created
            toast.success("Address created successfully!");
          } else if (addressCreateResponse) {
            toast.error(
              addressCreateResponse.data?.detail || "Failed to create address."
            );
          }
        }
      }

      // After all updates, re-fetch the complete user profile using /api/auth/me/
      // This ensures all displayed data is perfectly in sync with the backend.
      await fetchMeData(); // Use fetchMeData to get the updated profile

      setIsEditing(false);
    } catch (error) {
      // Errors from useData hooks are already handled by their respective useEffects
      console.error("Save changes error:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableUser(user); // Revert changes to the last saved user state
  };

  const formatAddress = (addresses) => {
    if (!addresses || addresses.length === 0) return "No address provided.";

    // For simplicity, display the first address.
    // In a production app, you might have multiple addresses and need to select/display a primary one.
    const addressObject = addresses[0];

    const parts = [];
    if (addressObject.building_house_no)
      parts.push(addressObject.building_house_no);
    if (addressObject.street_name) parts.push(addressObject.street_name);
    if (addressObject.barangay) parts.push(addressObject.barangay);
    if (addressObject.city_municipality)
      parts.push(addressObject.city_municipality);
    if (addressObject.province) parts.push(addressObject.province);
    if (addressObject.postal_code) parts.push(addressObject.postal_code);
    if (addressObject.country) parts.push(addressObject.country);
    return parts.filter(Boolean).join(", ");
  };

  const handleLogout = async () => {
    const BASE_URL = "http://127.0.0.1:8000/api";
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
        toast.dismiss();
        toast.success("Successfully logged out!");
      } else {
        toast.dismiss();
        toast.error("Logout failed. Please try again.");
      }
    } catch (logoutError) {
      console.error(
        "Logout Error:",
        logoutError.response?.data?.detail || logoutError.message
      );
      toast.dismiss();
      toast.error(
        logoutError.response?.data?.detail || "An error occurred during logout."
      );
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("cart"); // Assuming cart is stored in localStorage
      setUserInfo({}); // Clear user info in context
      navigate("/login");
    }
  };

  // Show loading indicator if profile data is being fetched or updated
  if (loadingProfile || meLoading || userUpdating || addressLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mr-3"></div>
        Loading user profile...
      </div>
    );
  }

  // If UserInfo is not available after loading, prompt for login
  if (!UserInfo.id) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-600">
        <p>Failed to load user profile. Please try logging in again.</p>
      </div>
    );
  }

  // Access the first address for editing and displaying, if it exists
  const currentAddress =
    editableUser.address && editableUser.address.length > 0
      ? editableUser.address[0]
      : {};

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
                      src={
                        user.profilePicture ||
                        "https://placehold.co/150x150/aabbcc/ffffff?text=Profile"
                      }
                      alt={`${user.first_name}'s Profile`}
                      className="w-36 h-36 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-blue-500 shadow-lg ring-4 ring-blue-200 ring-opacity-50 transition-all duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="flex-grow w-full">
                    {isEditing ? (
                      <div className="space-y-5">
                        <InputField
                          label="First Name"
                          name="first_name"
                          value={editableUser.first_name || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Middle Name"
                          name="middle_name"
                          value={editableUser.middle_name || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Last Name"
                          name="last_name"
                          value={editableUser.last_name || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Email"
                          name="email"
                          value={editableUser.email || ""}
                          onChange={handleChange}
                          type="email"
                          readOnly // Email from Django User is typically read-only
                        />
                        <InputField
                          label="Phone Number"
                          name="phone"
                          value={editableUser.phone || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Building/House No."
                          name="address.building_house_no"
                          value={currentAddress.building_house_no || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Street Name"
                          name="address.street_name"
                          value={currentAddress.street_name || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Barangay"
                          name="address.barangay"
                          value={currentAddress.barangay || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="City/Municipality"
                          name="address.city_municipality"
                          value={currentAddress.city_municipality || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Province"
                          name="address.province"
                          value={currentAddress.province || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Postal Code"
                          name="address.postal_code"
                          value={currentAddress.postal_code || ""}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Country"
                          name="address.country"
                          value={currentAddress.country || ""}
                          onChange={handleChange}
                        />
                        <div className="flex justify-end space-x-4 mt-8">
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {user.first_name}{" "}
                          {user.middle_name && `${user.middle_name} `}
                          {user.last_name}
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
                          {user.phone}
                        </p>
                        <p className="text-lg">
                          <strong className="font-semibold text-gray-800">
                            Address:
                          </strong>{" "}
                          {user.address && user.address.length > 0
                            ? `${formatAddress(user.address)} (${
                                user.address[0].address_type
                              })`
                            : "No address provided."}
                        </p>
                        <div className="mt-8 flex justify-between items-center">
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

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}) => (
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
      readOnly={readOnly}
      className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

export default UserProfile;
