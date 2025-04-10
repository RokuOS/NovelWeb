const Loading = ({ size = 'default', fullScreen = false }) => {
  let spinnerSize;
  
  switch (size) {
    case 'small':
      spinnerSize = 'w-6 h-6';
      break;
    case 'large':
      spinnerSize = 'w-16 h-16';
      break;
    default:
      spinnerSize = 'w-10 h-10';
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="text-center">
          <div className={`${spinnerSize} mx-auto border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin`}></div>
          <p className="mt-4 text-white text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${spinnerSize} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}></div>
      <p className="mt-2 text-gray-600">Đang tải...</p>
    </div>
  );
};

export default Loading; 