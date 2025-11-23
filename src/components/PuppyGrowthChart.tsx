interface PuppyGrowthChartProps {
    data: Array<{
        puppyId: string;
        puppyName: string;
        color: string;
        growthHistory: Array<{ date: string; weight: number }>;
    }>;
}

export const PuppyGrowthChart = ({ data }: PuppyGrowthChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No growth data available yet.</p>
                <p className="text-sm mt-2">Start logging weights to see the growth chart!</p>
            </div>
        );
    }

    // Generate color palette for puppies
    const colors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];

    // Find all unique dates across all puppies
    const allDates = new Set<string>();
    data.forEach(puppy => {
        puppy.growthHistory.forEach(entry => allDates.add(entry.date));
    });
    const sortedDates = Array.from(allDates).sort();

    // Find max weight for scaling
    const maxWeight = Math.max(
        ...data.flatMap(puppy => puppy.growthHistory.map(h => h.weight)),
        10
    );
    const yMax = Math.ceil(maxWeight * 1.2); // 20% padding

    const chartHeight = 400;
    const chartWidth = 800;
    const padding = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // Scale functions
    const xScale = (dateStr: string) => {
        const index = sortedDates.indexOf(dateStr);
        return padding.left + (index / (sortedDates.length - 1 || 1)) * innerWidth;
    };

    const yScale = (weight: number) => {
        return chartHeight - padding.bottom - (weight / yMax) * innerHeight;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Puppy Growth Chart</h3>

            <svg width={chartWidth} height={chartHeight} className="mx-auto">
                {/* Y-axis grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
                    const y = chartHeight - padding.bottom - fraction * innerHeight;
                    const weight = fraction * yMax;
                    return (
                        <g key={fraction}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={chartWidth - padding.right}
                                y2={y}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                            />
                            <text
                                x={padding.left - 10}
                                y={y + 5}
                                textAnchor="end"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {weight.toFixed(1)}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis */}
                <line
                    x1={padding.left}
                    y1={chartHeight - padding.bottom}
                    x2={chartWidth - padding.right}
                    y2={chartHeight - padding.bottom}
                    stroke="#374151"
                    strokeWidth="2"
                />

                {/* Y-axis */}
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={chartHeight - padding.bottom}
                    stroke="#374151"
                    strokeWidth="2"
                />

                {/* Y-axis label */}
                <text
                    x={20}
                    y={chartHeight / 2}
                    transform={`rotate(-90, 20, ${chartHeight / 2})`}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#374151"
                    fontWeight="600"
                >
                    Weight (lbs)
                </text>

                {/* X-axis label */}
                <text
                    x={chartWidth / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#374151"
                    fontWeight="600"
                >
                    Date
                </text>

                {/* Plot lines for each puppy */}
                {data.map((puppy, index) => {
                    const puppyColor = colors[index % colors.length];
                    const points = puppy.growthHistory
                        .map(entry => `${xScale(entry.date)},${yScale(entry.weight)}`)
                        .join(' ');

                    return (
                        <g key={puppy.puppyId}>
                            {/* Line */}
                            <polyline
                                points={points}
                                fill="none"
                                stroke={puppyColor}
                                strokeWidth="3"
                                strokeLinejoin="round"
                            />
                            {/* Data points */}
                            {puppy.growthHistory.map((entry, i) => (
                                <circle
                                    key={i}
                                    cx={xScale(entry.date)}
                                    cy={yScale(entry.weight)}
                                    r="5"
                                    fill={puppyColor}
                                    stroke="white"
                                    strokeWidth="2"
                                >
                                    <title>{`${puppy.puppyName}: ${entry.weight} lbs on ${new Date(entry.date).toLocaleDateString()}`}</title>
                                </circle>
                            ))}
                        </g>
                    );
                })}

                {/* X-axis date labels */}
                {sortedDates.map((date, index) => {
                    if (sortedDates.length > 10 && index % 2 !== 0) return null; // Skip some labels if too many
                    return (
                        <text
                            key={date}
                            x={xScale(date)}
                            y={chartHeight - padding.bottom + 20}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6b7280"
                        >
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </text>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {data.map((puppy, index) => (
                    <div key={puppy.puppyId} className="flex items-center space-x-2">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-sm text-gray-700">{puppy.puppyName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
