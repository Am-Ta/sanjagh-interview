import { useRef, useEffect, useState, useMemo, forwardRef, FC } from "react";

type Services = Array<{
  id: string;
  name: string;
}>;

type SearchInput = string;

type SearchResultsProps = {
  results: Services;
  containerClassName: string;
};

type FakeSpanProps = {
  textValue: SearchInput;
};

type FeatureFulSearchInputProps = {
  serviceSearchInputValue: SearchInput;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestionValue: string;
};

const SearchResults: FC<SearchResultsProps> = ({
  results,
  containerClassName,
}) => {
  if (!results.length) return null;

  return (
    <ul className={containerClassName}>
      {results.map(({ name }) => (
        <li
          key={name}
          className="border-b border-b-[#F5F5F5] p-3 cursor-pointer hover:bg-[#E5F1FF] list-none select-none"
        >
          {name}
        </li>
      ))}
    </ul>
  );
};

const FakeSpan = forwardRef<HTMLSpanElement, FakeSpanProps>(
  ({ textValue }, ref) => {
    return (
      <span ref={ref} className="invisible absolute whitespace-pre">
        {textValue}
      </span>
    );
  }
);

const FeatureFulSearchInput: FC<FeatureFulSearchInputProps> = ({
  serviceSearchInputValue,
  onChange,
  suggestionValue,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fakeSpanRef = useRef(null);

  let shouldInputExpand = suggestionValue.length === 0;

  useEffect(() => {
    if (fakeSpanRef.current) {
      const newWidth = getComputedStyle(fakeSpanRef.current).width;
      if (inputRef.current)
        inputRef.current.style.width = shouldInputExpand ? "100%" : newWidth;
    }
  }, [serviceSearchInputValue, shouldInputExpand]);

  return (
    <div className="flex w-full">
      <div className="flex justify-between items-center w-full relative overflow-hidden">
        <input
          ref={inputRef}
          // @ts-ignore
          type_="search"
          className="absolute outline-none text-gray-700"
          value={serviceSearchInputValue}
          onChange={onChange}
          placeholder="به چه خدمتی نیاز دارید؟"
        />

        <FakeSpan textValue={serviceSearchInputValue} ref={fakeSpanRef} />

        <input
          placeholder={suggestionValue}
          className="w-full outline-none"
          // @ts-ignore
          focusable="false"
        />
      </div>
    </div>
  );
};

export default function ServiceSearch() {
  const [serviceSearchInputValue, setServiceSearchInputValue] =
    useState<SearchInput>("");
  const [services, setServices] = useState<Services>([]);

  const results = useMemo(() => {
    if (serviceSearchInputValue.trim() !== "") {
      return services.filter((s) => s.name.includes(serviceSearchInputValue));
    }
    return [];
  }, [serviceSearchInputValue, services]);

  let firstSearchItemText = results[0]?.name || "";

  let isInputValueSubstringOfFirstSearchItem =
    serviceSearchInputValue ===
    firstSearchItemText.substring(0, serviceSearchInputValue.length);

  let suggestionInputPlaceholder = useMemo(() => {
    return isInputValueSubstringOfFirstSearchItem ? firstSearchItemText : "";
  }, [firstSearchItemText, isInputValueSubstringOfFirstSearchItem]);

  const handleSearchInputChange = ({
    currentTarget: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setServiceSearchInputValue(value);
  };

  useEffect(() => {
    fetch("/api/services?zoneId=1").then((res) => {
      res.json().then((s) => setServices(s));
    });
  }, []);

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-white z-[99999] cursor-default">
      <div className="px-3 py-7 max-w-96 m-auto">
        <div className="relative flex items-center w-full shadow-sm rounded-md">
          <div className="flex flex-col justify-center w-full relative">
            <div className="flex items-center p-3 border-gray-200 border rounded-lg h-12">
              <FeatureFulSearchInput
                serviceSearchInputValue={serviceSearchInputValue}
                onChange={handleSearchInputChange}
                suggestionValue={suggestionInputPlaceholder}
              />
            </div>
            <span className="absolute left-0 self-center h-9 w-0 border-r-[1px] border-gray-200" />
          </div>
          <SearchResults
            containerClassName="bg-white overflow-auto z-10 mt-12 top-0 max-h-72 absolute w-full border border-[#EAECED] rounded-b-md shadow-sm scrollbar-minimal"
            results={results}
          />
        </div>
      </div>
    </div>
  );
}
