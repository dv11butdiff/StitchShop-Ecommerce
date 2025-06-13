import { useEffect, useState } from "react";
import usePostalPH from "use-postal-ph";

const Postal = () => {
  // Initialize the usePostalPH hook within the component
  const postalPH = usePostalPH();

  // State variables for municipality and location inputs
  const [municipality, setMunicipality] = useState("");
  const [location, setLocation] = useState("");
  // State variable to store the fetched postal code(s)
  // Initialize as an empty ARRAY [] because we want to iterate over results,
  // even if there's only one. This simplifies rendering logic.
  const [fetchedPostalCodes, setFetchedPostalCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect hook to "react" to changes in municipality and location
  useEffect(() => {
    const fetchAndSetPostalCode = () => {
      // Only attempt to fetch if at least ONE field has a non-empty, non-whitespace value.
      // The library can search by municipality OR location OR both.
      if (municipality.trim() || location.trim()) {
        setIsLoading(true);
        console.log(
          `Triggering postal code lookup for: Municipality: "${municipality.trim()}", Location: "${location.trim()}"`
        );

        try {
          const result = postalPH.fetchDataLists({
            municipality: municipality.trim(),
            location: location.trim(),
          });

          let processedResults = [];

          // --- Precaution Measure / Robust Data Handling ---
          if (result) {
            if (Array.isArray(result)) {
              // Case 1: result is directly an array of PlaceProps objects
              processedResults = result;
            } else if (result.data && Array.isArray(result.data)) {
              // Case 2: result is an object with a 'data' property that is an array
              processedResults = result.data;
            } else if (
              // Case 3: result is a single PlaceProps object (your latest example)
              typeof result === "object" &&
              (result.location ||
                result.municipality ||
                result.post_code ||
                result.region) // Check if it looks like a PlaceProps object
            ) {
              processedResults = [result]; // Wrap the single object in an array
            }
          }

          setFetchedPostalCodes(processedResults);
          console.log("Fetched Results (Processed):", processedResults); // Log the actual array being set
        } catch (error) {
          console.error("Error fetching postal code in Register.jsx:", error);
          setFetchedPostalCodes([]); // Clear results on any unexpected error
        } finally {
          setIsLoading(false);
        }
      } else {
        // If both inputs are empty or just whitespace, clear results and stop loading
        setFetchedPostalCodes([]);
        setIsLoading(false);
      }
    };

    // Calls everytime input changes
    fetchAndSetPostalCode();
  }, [municipality, location, postalPH]); // Dependencies: Effect runs when these values change

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  // Handler for municipality input change
  const handleMunicipalityChange = (event) => {
    setMunicipality(toTitleCase(event.target.value));
  };

  // Handler for location input change
  const handleLocationChange = (event) => {
    setLocation(toTitleCase(event.target.value));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Philippine Postal Code Lookup
        </h2>

        {/* Municipality Input */}
        <div className="mb-4">
          <label
            htmlFor="municipality"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Municipality/City:
          </label>
          <input
            type="text"
            id="municipality"
            value={municipality}
            onChange={handleMunicipalityChange}
            placeholder="e.g., Bacoor"
            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
          />
        </div>

        {/* Location Input */}
        <div className="mb-6">
          <label
            htmlFor="location"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Location (e.g., Province or Specific Area):
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={handleLocationChange}
            placeholder="e.g., Molino or Cavite"
            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
          />
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <p className="text-center text-blue-500 mb-4">
            Searching for postal codes...
          </p>
        )}

        {/* Display Postal Code Results */}
        {/* Only show results if not loading AND there are results AND at least one input has value */}
        {!isLoading &&
          fetchedPostalCodes.length > 0 &&
          (municipality.trim() || location.trim()) && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Found Postal Codes:</h3>
              <ul className="list-disc list-inside">
                {fetchedPostalCodes.map((item, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-semibold">{item.post_code}</span> -{" "}
                    {item.municipality}, {item.location}
                    {item.region && `, ${item.region}`}{" "}
                    {/* Conditionally display region */}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* No results found, but inputs have values */}
        {/* Display this if NOT loading, and at least one input has content, but no results found */}
        {!isLoading &&
          (municipality.trim() || location.trim()) &&
          fetchedPostalCodes.length === 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-center">
              No postal code found for "{municipality.trim()}" and "
              {location.trim()}". Please try another combination or leave one
              field blank.
            </div>
          )}

        {/* Instructions when inputs are empty */}
        {/* Display this only if both inputs are completely empty */}
        {!municipality.trim() && !location.trim() && (
          <div className="bg-gray-50 border border-gray-200 text-gray-700 p-4 rounded-lg text-center">
            Enter municipality and/or location to find postal codes.
          </div>
        )}
      </div>
    </div>
  );
};

export default Postal;
