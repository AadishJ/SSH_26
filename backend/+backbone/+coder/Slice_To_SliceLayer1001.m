classdef Slice_To_SliceLayer1001 < nnet.layer.Layer & nnet.layer.Formattable
    % A custom layer auto-generated while importing an ONNX network.
    %#codegen

    %#ok<*PROPLC>
    %#ok<*NBRAK>
    %#ok<*INUSL>
    %#ok<*VARARG>
    properties (Learnable)
    end

    properties (State)
    end

    properties
        Vars
        NumDims
    end

    methods(Static, Hidden)
        % Specify the properties of the class that will not be modified
        % after the first assignment.
        function p = matlabCodegenNontunableProperties(~)
            p = {
                % Constants, i.e., Vars, NumDims and all learnables and states
                'Vars'
                'NumDims'
                };
        end
    end


    methods(Static, Hidden)
        % Instantiate a codegenable layer instance from a MATLAB layer instance
        function this_cg = matlabCodegenToRedirected(mlInstance)
            this_cg = backbone.coder.Slice_To_SliceLayer1001(mlInstance);
        end
        function this_ml = matlabCodegenFromRedirected(cgInstance)
            this_ml = backbone.Slice_To_SliceLayer1001(cgInstance.Name);
            if isstruct(cgInstance.Vars)
                names = fieldnames(cgInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this_ml.Vars.(fieldname) = dlarray(cgInstance.Vars.(fieldname));
                end
            else
                this_ml.Vars = [];
            end
            this_ml.NumDims = cgInstance.NumDims;
        end
    end

    methods
        function this = Slice_To_SliceLayer1001(mlInstance)
            this.Name = mlInstance.Name;
            this.OutputNames = {'onnx__Add_385'};
            if isstruct(mlInstance.Vars)
                names = fieldnames(mlInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this.Vars.(fieldname) = backbone.coder.ops.extractIfDlarray(mlInstance.Vars.(fieldname));
                end
            else
                this.Vars = [];
            end

            this.NumDims = mlInstance.NumDims;
        end

        function [onnx__Add_385] = predict(this, onnx__Slice_574__)
            if isdlarray(onnx__Slice_574__)
                onnx__Slice_574_ = stripdims(onnx__Slice_574__);
            else
                onnx__Slice_574_ = onnx__Slice_574__;
            end
            onnx__Slice_574NumDims = 4;
            onnx__Slice_574 = backbone.coder.ops.permuteInputVar(onnx__Slice_574_, [4 3 1 2], 4);

            [onnx__Add_385__, onnx__Add_385NumDims__] = Slice_To_SliceGraph1002(this, onnx__Slice_574, onnx__Slice_574NumDims, false);
            onnx__Add_385_ = backbone.coder.ops.permuteOutputVar(onnx__Add_385__, [3 4 2 1], 4);

            onnx__Add_385 = dlarray(single(onnx__Add_385_), 'SSCB');
        end

        function [onnx__Add_385, onnx__Add_385NumDims1003] = Slice_To_SliceGraph1002(this, onnx__Slice_574, onnx__Slice_574NumDims, Training)

            % Execute the operators:
            % Slice:
            [indices1002, onnx__Slice_380NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_574, this.Vars.onnx__Slice_377, this.Vars.onnx__Slice_378, this.Vars.onnx__Slice_376, this.Vars.onnx__Slice_379, coder.const(onnx__Slice_574NumDims));
            onnx__Slice_380 = onnx__Slice_574(indices1002{:});

            % Slice:
            [indices1003, onnx__Add_385NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_380, this.Vars.onnx__Slice_382, this.Vars.onnx__Slice_383, this.Vars.onnx__Slice_381, this.Vars.onnx__Slice_384, coder.const(onnx__Slice_380NumDims));
            onnx__Add_385 = onnx__Slice_380(indices1003{:});

            % Set graph output arguments
            onnx__Add_385NumDims1003 = coder.const(onnx__Add_385NumDims);

        end

    end

end