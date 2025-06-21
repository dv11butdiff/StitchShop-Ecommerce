import Select from "react-select";
import useData from "../utils/dataUtil";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#0f3460",
    color: "white",
    borderRadius: "5px",
    border: "none",
    boxShadow: "none",
    width: "200px",
    height: "40px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#0f3460" : "white",
    color: state.isSelected ? "white" : "#0f3460",
    "&:hover": {
      backgroundColor: "#0f3460",
      color: "white",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "white",
  }),
};

const FilterSelect = ({ setSelectedCategory }) => {
  const [categories, setCategories] = useState([]);

  const { data, loading, error, getData } = useData("categories/");

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error("Failed to load categories. Please try again.");
    }
  }, [error]);

  const handleChange = (selectedOption) => {
    setSelectedCategory(selectedOption.value);
  };

  const defaultValue = { value: "", label: "Filter By Category" };
  const options = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));
  options.push(defaultValue);

  return (
    <Select
      options={options}
      defaultValue={defaultValue}
      styles={customStyles}
      onChange={handleChange}
    />
  );
};

export default FilterSelect;
