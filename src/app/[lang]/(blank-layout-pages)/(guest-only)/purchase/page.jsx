import React from "react";

const Page = () => {
    const pricing = [
        {
            id: 1,
            title: "Bronze Plan",
            description: "Basic lead tracking and management",
            price: 1199,
            features: [
                "Basic lead tracking and management",
                "Email support",
                "Standard reports and dashboards",
                "Data storage up to 5 GB",
            ],
        },
        {
            id: 2,
            title: "Gold Plan",
            description: "Includes all features from the Silver plan",
            price: 2200,
            features: [
                "Includes all features from the Silver plan",
                "Priority support",
                "Customizable dashboards",
                "Advanced integration capabilities",
                "Sales forecasting tools",
                "Unlimited data storage",
            ],
        },
        {
            id: 3,
            title: "Silver Plan",
            description: "Includes all features from the Bronze plan",
            price: 1599,
            features: [
                "Includes all features from the Bronze plan",
                "Phone and email support",
                "Advanced reporting and analytics",
                "Marketing automation tools",
                "Data storage up to 20 GB",
            ],
        },
    ];

    return (
        <div className="text-center my-12">
            {/* Added H1 Heading */}
            <h1 className="text-4xl font-bold mb-8 text-gray-800">
                Our Pricing Plans
            </h1>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8 max-lg:flex-wrap">
                {pricing.map((item, index) => (
                    <div
                        key={item.id}
                        className={`p-8 rounded-2xl text-center ${index === 0
                            ? "w-72 border border-brown-600"
                            : index === 1
                                ? "w-80 border border-yellow-600"
                                : "w-72 border border-gray-600"
                            }`}
                    >
                        <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <div className="text-gray-800 mb-6">
                            <span className="text-xl font-bold">₹</span>
                            <span className="text-4xl font-bold">{item.price}</span>
                            <span className="text-lg font-medium">+GST</span>
                        </div>
                        <button className="w-full bg-orange-600 text-white py-2 rounded-md cursor-pointer">
                            {`Choose ${item.title.split(" ")[0]}`}
                        </button>
                        <ul className="mt-6 space-y-2 text-left">
                            {item.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-start">
                                    <span className="text-green-500 font-bold mr-2">✔</span>
                                    <p className="text-gray-700">{feature}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
